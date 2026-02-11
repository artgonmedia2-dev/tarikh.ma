<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentPageController extends Controller
{
    private const WATERMARK_TEXT = 'Tarikh.ma';

    /** Return signed URLs for the requested page numbers (for flipbook preload/lazy load). */
    public function signedUrls(Request $request, Document $document): JsonResponse
    {
        if ($document->pages_status !== 'completed' || ! $document->pages_count) {
            return response()->json(['message' => 'Pages not available'], 404);
        }

        $pages = $request->input('pages');
        if (is_string($pages)) {
            $pages = array_map('intval', array_filter(explode(',', $pages)));
        }
        $pages = is_array($pages) ? array_values(array_unique(array_filter($pages, fn ($p) => $p >= 1 && $p <= $document->pages_count))) : [];

        if (count($pages) > 50) {
            $pages = array_slice($pages, 0, 50);
        }

        $urls = [];
        foreach ($pages as $page) {
            $urls[(string) $page] = URL::temporarySignedRoute(
                'api.documents.pages.stream',
                now()->addMinutes(15),
                ['document' => $document->id, 'page' => $page]
            );
        }

        return response()->json($urls);
    }

    /** Stream a single page image with watermark (signed route). */
    public function stream(Document $document, int $page): StreamedResponse
    {
        if ($document->pages_status !== 'completed' || $page < 1 || $page > (int) $document->pages_count) {
            abort(404);
        }

        $path = "documents/{$document->id}/pages/{$page}.jpg";
        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);

        return response()->stream(function () use ($fullPath) {
            $img = @imagecreatefromjpeg($fullPath);
            if ($img === false) {
                readfile($fullPath);
                return;
            }
            $w = imagesx($img);
            $h = imagesy($img);
            
            // Diagonal repeating watermark for better protection
            $watermarkColor = imagecolorallocatealpha($img, 100, 100, 100, 85);
            $fontSize = max(3, min(5, (int)($w * 0.008)));
            $text = self::WATERMARK_TEXT;
            $textWidth = imagefontwidth($fontSize) * strlen($text);
            $textHeight = imagefontheight($fontSize);
            
            // Create diagonal pattern
            $spacingX = max(150, $textWidth + 80);
            $spacingY = max(100, $textHeight + 60);
            
            for ($y = -$h; $y < $h * 2; $y += $spacingY) {
                for ($x = -$w; $x < $w * 2; $x += $spacingX) {
                    // Offset every other row
                    $offsetX = (($y / $spacingY) % 2 == 0) ? 0 : $spacingX / 2;
                    $posX = (int)($x + $offsetX);
                    $posY = (int)$y;
                    
                    // Skip if outside image bounds
                    if ($posX < -$textWidth || $posX > $w || $posY < -$textHeight || $posY > $h) {
                        continue;
                    }
                    
                    imagestring($img, $fontSize, $posX, $posY, $text, $watermarkColor);
                }
            }
            
            imagejpeg($img, null, 85);
            imagedestroy($img);
        }, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="page-' . $page . '.jpg"',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
