/**
 * Flipbook PDF — effet de livre réel (drag, touch, ombre).
 * Pages chargées à la demande via PDF.js, stream sécurisé Laravel uniquement.
 */
import { forwardRef, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

let workerInitialized = false;
function setPdfWorker() {
  if (workerInitialized) return;
  try {
    // Vite: worker en ?url pour résolution au build
    const url = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
    GlobalWorkerOptions.workerSrc = url.href;
    workerInitialized = true;
  } catch {
    workerInitialized = true;
  }
}

export type PdfFlipbookProps = {
  /** URL blob du PDF (stream Laravel, pas d’URL directe) */
  blobUrl: string;
  /** Titre du document (accessibilité) */
  title?: string;
  /** Largeur du livre (px) */
  width: number;
  /** Hauteur du livre (px) */
  height: number;
  /** Page courante (1-based), contrôlée */
  currentPage: number;
  /** Callback à chaque changement de page (1-based) */
  onPageChange: (page: number) => void;
  /** Zoom (100 = 100%) */
  zoom?: number;
  /** Classe conteneur */
  className?: string;
  /** Désactiver clic droit / copie (lecture seule) */
  readOnly?: boolean;
};

/** Une page PDF rendue en canvas (chargement à la demande) */
const PdfPage = forwardRef<
  HTMLDivElement,
  { pageNum: number; pdfDoc: PDFDocumentProxy | null; width: number; height: number }
>(function PdfPage({ pageNum, pdfDoc, width, height }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || pageNum < 1) return;
    let cancelled = false;
    pdfDoc.getPage(pageNum).then((page) => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(width / baseViewport.width, height / baseViewport.height);
      const viewport = page.getViewport({ scale });
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      ctx.scale(dpr, dpr);
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        if (!cancelled) setLoaded(true);
      });
    });
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, width, height]);

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center bg-white overflow-hidden"
      style={{ width, height }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <span className="text-slate-400 text-sm">Chargement…</span>
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
    </div>
  );
});

export function PdfFlipbook({
  blobUrl,
  width,
  height,
  currentPage,
  onPageChange,
  zoom = 100,
  className = '',
  readOnly = true,
}: PdfFlipbookProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bookRef = useRef<{ pageFlip: () => { turnToPage: (n: number) => void; getCurrentPageIndex: () => number } } | null>(null);

  useEffect(() => {
    setPdfWorker();
    setPdfDoc(null);
    setNumPages(0);
    setError(null);
    getDocument(blobUrl).promise
      .then((doc) => {
        setPdfDoc((prev) => {
          prev?.destroy?.();
          return doc;
        });
        return doc.getMetadata().then(() => doc.numPages);
      })
      .then((n) => setNumPages(n))
      .catch((e) => setError(e?.message || 'Erreur chargement PDF'));
  }, [blobUrl]);

  useEffect(() => {
    const api = bookRef.current?.pageFlip?.();
    if (!api || numPages === 0) return;
    const idx = Math.max(0, Math.min(currentPage - 1, numPages - 1));
    api.turnToPage(idx);
  }, [currentPage, numPages]);

  const onFlip = (e: { data: number }) => {
    const oneBased = Number(e.data) + 1;
    if (oneBased >= 1 && oneBased <= numPages) onPageChange(oneBased);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-lg p-8">
        <p className="text-slate-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!pdfDoc || numPages === 0) {
    return (
      <div className="flex items-center justify-center bg-slate-50 rounded-lg p-8" style={{ width, height }}>
        <span className="text-slate-500 text-sm">Chargement du document…</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
      onContextMenu={readOnly ? (e) => e.preventDefault() : undefined}
    >
      <HTMLFlipBook
        ref={bookRef}
        width={width}
        height={height}
        size="fixed"
        drawShadow
        flippingTime={500}
        maxShadowOpacity={0.5}
        showCover={false}
        usePortrait
        useMouseEvents
        mobileScrollSupport={false}
        swipeDistance={30}
        clickEventForward={false}
        onFlip={onFlip}
        showPageCorners={true}
        disableFlipByClick={false}
        style={{}}
        minWidth={width}
        maxWidth={width}
        minHeight={height}
        maxHeight={height}
        startPage={0}
        startZIndex={0}
        autoSize={true}
        className="shadow-lg border border-slate-200 rounded overflow-hidden"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <PdfPage
            key={i}
            pageNum={i + 1}
            pdfDoc={pdfDoc}
            width={width}
            height={height}
          />
        ))}
      </HTMLFlipBook>
    </div>
  );
}
