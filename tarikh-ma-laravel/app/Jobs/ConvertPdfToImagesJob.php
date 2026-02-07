<?php

namespace App\Jobs;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;

class ConvertPdfToImagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 1800;

    public function __construct(
        public Document $document
    ) {
        $this->onQueue('pdf-conversion');
    }

    public function handle(): void
    {
        if ($this->document->type !== 'pdf') {
            return;
        }

        $path = $this->document->file_path;
        if (! Storage::disk('local')->exists($path)) {
            $this->document->update(['pages_status' => 'failed']);
            $this->clearProgress();
            return;
        }

        $this->document->update(['pages_status' => 'processing']);
        $this->setProgress(0, 0);

        $fullPath = Storage::disk('local')->path($path);
        $pagesDir = "documents/{$this->document->id}/pages";
        $storagePath = Storage::disk('local')->path($pagesDir);

        try {
            if (! is_dir($storagePath)) {
                mkdir($storagePath, 0755, true);
            }

            $numPages = $this->convertPdfToImages($fullPath, $storagePath);
            if ($numPages === 0) {
                throw new \RuntimeException('No pages extracted');
            }

            // Extract text content from PDF (native or OCR fallback)
            $textContent = $this->extractPdfText($fullPath, $storagePath);

            $this->document->update([
                'pages_count' => $numPages,
                'pages_status' => 'completed',
                'pages_converted_at' => now(),
                'content' => $textContent,
            ]);
            $this->setProgress($numPages, $numPages);
        } catch (\Throwable $e) {
            Log::error('ConvertPdfToImagesJob failed', [
                'document_id' => $this->document->id,
                'message' => $e->getMessage(),
            ]);
            $this->document->update(['pages_status' => 'failed']);
            $this->clearProgress();
            if (is_dir($storagePath)) {
                array_map('unlink', glob($storagePath . '/*.jpg') ?: []);
                @rmdir($storagePath);
            }
            throw $e;
        }
    }

    /**
     * Extract text content from a PDF file.
     * First tries smalot/pdfparser for native PDFs.
     * Falls back to Tesseract OCR for scanned PDFs.
     */
    private function extractPdfText(string $pdfPath, string $imagesDir): ?string
    {
        // First try native PDF text extraction
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($pdfPath);
            $text = $pdf->getText();

            // Clean up the extracted text
            $text = preg_replace('/\s+/', ' ', $text);
            $text = trim($text);

            // If we got meaningful text (more than 100 chars), use it
            if (strlen($text) > 100) {
                Log::info('PDF text extracted natively', [
                    'document_id' => $this->document->id,
                    'text_length' => strlen($text),
                ]);

                // Limit text size
                if (strlen($text) > 1048576) {
                    $text = substr($text, 0, 1048576);
                }
                return $text;
            }
        } catch (\Throwable $e) {
            Log::warning('Native PDF text extraction failed', [
                'document_id' => $this->document->id,
                'message' => $e->getMessage(),
            ]);
        }

        // Fallback to OCR for scanned PDFs
        return $this->extractTextWithOcr($imagesDir);
    }

    /**
     * Extract text from images using Tesseract OCR.
     */
    private function extractTextWithOcr(string $imagesDir): ?string
    {
        // Check if Tesseract is available
        $tesseractPath = $this->findTesseract();
        if (!$tesseractPath) {
            Log::warning('Tesseract OCR not found, skipping OCR extraction', [
                'document_id' => $this->document->id,
            ]);
            return null;
        }

        $imageFiles = glob($imagesDir . '/*.jpg') ?: [];
        if (empty($imageFiles)) {
            return null;
        }

        // Sort files numerically (1.jpg, 2.jpg, etc.)
        usort($imageFiles, function ($a, $b) {
            return (int) basename($a, '.jpg') - (int) basename($b, '.jpg');
        });

        $allText = [];
        $totalPages = count($imageFiles);

        Log::info('Starting OCR extraction', [
            'document_id' => $this->document->id,
            'total_pages' => $totalPages,
        ]);

        foreach ($imageFiles as $index => $imagePath) {
            try {
                $ocr = new \thiagoalessio\TesseractOCR\TesseractOCR($imagePath);
                $ocr->executable($tesseractPath);
                $ocr->lang('fra', 'ara', 'eng'); // French, Arabic, English
                
                $pageText = $ocr->run();
                $pageText = preg_replace('/\s+/', ' ', $pageText);
                $pageText = trim($pageText);
                
                if ($pageText) {
                    $allText[] = $pageText;
                }

                // Update progress
                $this->setProgress($index + 1, $totalPages);
            } catch (\Throwable $e) {
                Log::warning('OCR failed for page', [
                    'document_id' => $this->document->id,
                    'page' => $index + 1,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        $fullText = implode(' ', $allText);
        
        Log::info('OCR extraction completed', [
            'document_id' => $this->document->id,
            'text_length' => strlen($fullText),
        ]);

        // Limit text size
        if (strlen($fullText) > 1048576) {
            $fullText = substr($fullText, 0, 1048576);
        }

        return $fullText ?: null;
    }

    /**
     * Find Tesseract executable path.
     */
    private function findTesseract(): ?string
    {
        // Check common Windows paths
        $windowsPaths = [
            'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
            'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe',
            'tesseract', // PATH
        ];

        foreach ($windowsPaths as $path) {
            if (file_exists($path) || $this->commandExists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Check if a command exists in PATH.
     */
    private function commandExists(string $command): bool
    {
        $whereCmd = PHP_OS_FAMILY === 'Windows' ? 'where' : 'which';
        exec("$whereCmd $command 2>&1", $output, $code);
        return $code === 0;
    }

    private function setProgress(int $current, int $total): void
    {
        Cache::put("doc_conversion_{$this->document->id}", [
            'current' => $current,
            'total' => $total,
        ], now()->addDay());
    }

    private function clearProgress(): void
    {
        Cache::forget("doc_conversion_{$this->document->id}");
    }

    /**
     * Convert PDF to one JPG per page. Uses Imagick if available, else Ghostscript.
     */
    private function convertPdfToImages(string $pdfPath, string $outputDir): int
    {
        if (class_exists(\Imagick::class)) {
            return $this->convertWithImagick($pdfPath, $outputDir);
        }

        return $this->convertWithGhostscript($pdfPath, $outputDir);
    }

    private function convertWithImagick(string $pdfPath, string $outputDir): int
    {
        $im = new \Imagick($pdfPath);
        $numPages = (int) $im->getNumberImages();
        $im->setResolution(150, 150);

        for ($i = 0; $i < $numPages; $i++) {
            $im->setIteratorIndex($i);
            $im->setImageFormat('jpg');
            $im->setImageCompressionQuality(85);
            $pageNum = $i + 1;
            $outPath = $outputDir . '/' . $pageNum . '.jpg';
            $im->writeImage($outPath);
            $this->setProgress($pageNum, $numPages);
        }

        $im->clear();
        $im->destroy();

        return $numPages;
    }

    private function convertWithGhostscript(string $pdfPath, string $outputDir): int
    {
        $gs = trim((string) exec('which gs 2>/dev/null || where gs 2>nul'));
        if ($gs === '') {
            throw new \RuntimeException('Ghostscript (gs) not found. Install it or enable PHP Imagick.');
        }

        $outputPattern = $outputDir . '/%d.jpg';
        $cmd = sprintf(
            'gs -dNOPAUSE -dBATCH -sDEVICE=jpeg -dJPEGQ=85 -r150 -dFirstPage=1 -dLastPage=99999 -sOutputFile=%s %s 2>&1',
            escapeshellarg($outputPattern),
            escapeshellarg($pdfPath)
        );
        exec($cmd, $out, $code);
        if ($code !== 0) {
            throw new \RuntimeException('Ghostscript failed: ' . implode("\n", $out));
        }

        $files = glob($outputDir . '/*.jpg') ?: [];
        $numPages = count($files);
        foreach (range(1, $numPages) as $p) {
            $this->setProgress($p, $numPages);
        }

        return $numPages;
    }
}
