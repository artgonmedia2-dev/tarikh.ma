/**
 * PDF.js-based flipbook — renders PDF pages directly in browser canvas.
 * No server-side conversion needed (Imagick/Ghostscript).
 * Includes watermark overlay, copy protection, and in-document search.
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Import worker URL via Vite (standard and robust way)
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js to use this worker
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Flip sound (same as ImageFlipbook)
const FLIP_SOUND_DATA = 'data:audio/mp3;base64,//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kMQAD8AAADSAAAAANIAAADSAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
let flipAudioInstance: HTMLAudioElement | null = null;

function playFlipSound(): void {
    try {
        if (!flipAudioInstance) {
            flipAudioInstance = new Audio(FLIP_SOUND_DATA);
            flipAudioInstance.volume = 0.25;
        }
        flipAudioInstance.currentTime = 0;
        flipAudioInstance.play().catch(() => { });
    } catch {
        // Ignore audio errors
    }
}

// Search result type
type SearchMatch = {
    pageNum: number;
    matchIndex: number;
};

export type PdfJsFlipbookProps = {
    pdfUrl: string;
    currentPage: number;
    onRequestPrev: () => void;
    onRequestNext: () => void;
    onTotalPagesChange: (total: number) => void;
    onPageChange?: (page: number) => void;
    zoom?: number;
    title?: string;
    className?: string;
    flipPhase: 'out' | 'in' | null;
    flipDirection: 'next' | 'prev' | null;
    onFlipAnimationEnd: (e: React.AnimationEvent<HTMLDivElement>) => void;
    isFlipping: boolean;
};

export function PdfJsFlipbook({
    pdfUrl,
    currentPage,
    onRequestPrev,
    onRequestNext,
    onTotalPagesChange,
    onPageChange,
    zoom = 100,
    title,
    className = '',
    flipPhase,
    flipDirection,
    onFlipAnimationEnd,
    isFlipping,
}: PdfJsFlipbookProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<string | null>(null);
    const [rendering, setRendering] = useState(false);
    const renderInProgress = useRef(false);

    // Search state
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [searching, setSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Load PDF document
    useEffect(() => {
        if (!pdfUrl) return;

        let active = true;
        setLoading(true);
        setErrorStatus(null);

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        loadingTask.promise
            .then((doc) => {
                if (!active) return;
                setPdfDoc(doc);
                setTotalPages(doc.numPages);
                onTotalPagesChange(doc.numPages);
                setLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                // Silently ignore "Loading aborted" which happens during HMR/Strict Mode
                if (err.name === 'AbortException' || err.name === 'RenderingCancelledException') return;

                console.error('PdfJsFlipbook: Error loading PDF:', err);
                setErrorStatus(err.message || 'Erreur inconnue lors du chargement');
                setLoading(false);
            });

        return () => {
            active = false;
            // Removed direct loadingTask.destroy() to avoid "worker is being destroyed" race conditions
            // in developer environments (React Strict Mode).
        };
    }, [pdfUrl, onTotalPagesChange]);

    // Render current page
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current || renderInProgress.current) return;

        // Defer rendering while animation is active to keep UI smooth
        if (isFlipping && flipPhase !== 'in') {
            return;
        }

        const renderPage = async () => {
            renderInProgress.current = true;
            setRendering(true);
            console.log(`[PdfJs] Rendering page ${currentPage}`);

            try {
                const page = await pdfDoc.getPage(currentPage);
                const canvas = canvasRef.current!;
                const ctx = canvas.getContext('2d')!;

                // Calculate scale for good quality
                const baseScale = 2.0;
                const viewport = page.getViewport({ scale: baseScale * (zoom / 100) });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Clear before render
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({
                    canvasContext: ctx,
                    viewport: viewport,
                }).promise;

                // Draw watermark overlay
                drawWatermark(ctx, canvas.width, canvas.height);
                console.log(`[PdfJs] Page ${currentPage} rendered`);

            } catch (err) {
                console.error('[PdfJs] Page render error:', err);
            } finally {
                setRendering(false);
                renderInProgress.current = false;
            }
        };

        const timeout = setTimeout(renderPage, isFlipping ? 50 : 0);
        return () => clearTimeout(timeout);
    }, [pdfDoc, currentPage, zoom, isFlipping, flipPhase]);

    // Draw diagonal watermark pattern - Less dense
    const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const text = 'Tarikh.ma';
        ctx.save();
        ctx.font = '24px serif';
        ctx.fillStyle = 'rgba(100, 100, 100, 0.08)';

        const textWidth = ctx.measureText(text).width;
        const spacingX = Math.max(400, textWidth + 200);
        const spacingY = 300;

        ctx.rotate(-25 * Math.PI / 180);

        for (let y = -height; y < height * 2; y += spacingY) {
            for (let x = -width; x < width * 2; x += spacingX) {
                const offsetX = ((y / spacingY) % 2 === 0) ? 0 : spacingX / 2;
                ctx.fillText(text, x + offsetX, y);
            }
        }
        ctx.restore();
    };

    // Keyboard shortcut for search (Ctrl+F / Cmd+F)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape' && searchOpen) {
                setSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchOpen]);

    // Search function
    const performSearch = useCallback(async () => {
        if (!pdfDoc || !searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        const results: SearchMatch[] = [];
        const query = searchQuery.toLowerCase();

        console.log(`[PdfJs Search] Searching for: "${query}" in ${pdfDoc.numPages} pages`);

        try {
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: unknown) => (item as { str: string }).str)
                    .join(' ')
                    .toLowerCase();

                // Debug: Log first 200 chars of each page's text
                if (pageNum <= 3) {
                    console.log(`[PdfJs Search] Page ${pageNum} text (first 200 chars):`, pageText.slice(0, 200) || '(empty - no text layer)');
                }

                let startIndex = 0;
                let matchIndex = 0;
                while ((startIndex = pageText.indexOf(query, startIndex)) !== -1) {
                    results.push({ pageNum, matchIndex });
                    matchIndex++;
                    startIndex += query.length;
                }
            }

            console.log(`[PdfJs Search] Found ${results.length} results`);
            setSearchResults(results);
            setCurrentResultIndex(0);

            // Navigate to first result
            if (results.length > 0 && onPageChange) {
                onPageChange(results[0].pageNum);
            }
        } catch (err) {
            console.error('[PdfJs] Search error:', err);
        } finally {
            setSearching(false);
        }
    }, [pdfDoc, searchQuery, onPageChange]);

    // Auto-trigger search with debounce (300ms delay)
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const debounceTimer = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, performSearch]);

    // Navigate to next/previous search result
    const goToNextResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentResultIndex + 1) % searchResults.length;
        setCurrentResultIndex(nextIndex);
        if (onPageChange) {
            onPageChange(searchResults[nextIndex].pageNum);
        }
    }, [searchResults, currentResultIndex, onPageChange]);

    const goToPrevResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentResultIndex(prevIndex);
        if (onPageChange) {
            onPageChange(searchResults[prevIndex].pageNum);
        }
    }, [searchResults, currentResultIndex, onPageChange]);

    if (errorStatus) {
        return (
            <div className={`flex flex-col items-center justify-center bg-slate-100 rounded p-6 text-center ${className}`} style={{ minHeight: 280 }}>
                <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
                <span className="text-slate-600 text-sm font-medium mb-1">Impossible de charger le PDF.</span>
                <span className="text-slate-400 text-xs">{errorStatus}</span>
            </div>
        );
    }

    const goPrev = () => {
        playFlipSound();
        onRequestPrev();
    };

    const goNext = () => {
        playFlipSound();
        onRequestNext();
    };

    return (
        <div className={`cahier-viewer cahier-viewer-brochure relative w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden ${isFlipping ? 'is-flipping' : ''} ${className}`}>
            {/* Search bar */}
            {searchOpen && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-3 py-2">
                    <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (e.shiftKey) {
                                    goToPrevResult();
                                } else if (searchResults.length > 0) {
                                    goToNextResult();
                                } else {
                                    performSearch();
                                }
                            }
                        }}
                        placeholder="Rechercher dans le document..."
                        className="w-48 sm:w-64 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        autoFocus
                    />
                    {searching ? (
                        <span className="text-xs text-slate-400 animate-pulse">...</span>
                    ) : searchResults.length > 0 ? (
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                            {currentResultIndex + 1} / {searchResults.length}
                        </span>
                    ) : searchQuery && !searching ? (
                        <span className="text-xs text-slate-400">0 résultat</span>
                    ) : null}
                    <button
                        type="button"
                        onClick={goToPrevResult}
                        disabled={searchResults.length === 0}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Résultat précédent (Shift+Entrée)"
                    >
                        <span className="material-symbols-outlined text-lg text-slate-500">expand_less</span>
                    </button>
                    <button
                        type="button"
                        onClick={goToNextResult}
                        disabled={searchResults.length === 0}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Résultat suivant (Entrée)"
                    >
                        <span className="material-symbols-outlined text-lg text-slate-500">expand_more</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            setSearchResults([]);
                        }}
                        className="p-1 hover:bg-slate-100 rounded"
                        title="Fermer (Échap)"
                    >
                        <span className="material-symbols-outlined text-lg text-slate-500">close</span>
                    </button>
                </div>
            )}

            {/* Search toggle button */}
            {!searchOpen && (
                <button
                    type="button"
                    onClick={() => {
                        setSearchOpen(true);
                        setTimeout(() => searchInputRef.current?.focus(), 100);
                    }}
                    className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 transition-all hover:scale-105"
                    title="Rechercher (Ctrl+F)"
                >
                    <span className="material-symbols-outlined text-xl">search</span>
                </button>
            )}

            {/* Navigation buttons */}
            <button
                type="button"
                onClick={goPrev}
                disabled={currentPage <= 1 || isFlipping || loading}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105"
                aria-label="Page précédente"
            >
                <span className="material-symbols-outlined text-2xl sm:text-3xl font-light">chevron_left</span>
            </button>
            <button
                type="button"
                onClick={goNext}
                disabled={currentPage >= totalPages || isFlipping || loading}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105"
                aria-label="Page suivante"
            >
                <span className="material-symbols-outlined text-2xl sm:text-3xl font-light">chevron_right</span>
            </button>

            {/* Click zones */}
            <div role="button" tabIndex={0} onClick={goPrev} onKeyDown={(e) => e.key === 'Enter' && goPrev()} className="cahier-zone-prev" aria-label="Page précédente (zone)" aria-disabled={isFlipping} />
            <div role="button" tabIndex={0} onClick={goNext} onKeyDown={(e) => e.key === 'Enter' && goNext()} className="cahier-zone-next" aria-label="Page suivante (zone)" aria-disabled={isFlipping} />

            {/* Page container with flip animation */}
            <div
                className={`cahier-page relative w-full h-full flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] max-h-[75vh] sm:max-h-[80vh] ${flipPhase && flipDirection ? `turn-${flipDirection}-${flipPhase}` : ''}`}
                onAnimationEnd={onFlipAnimationEnd}
            >
                <div className="cahier-page-inner absolute inset-0 flex items-center justify-center rounded overflow-hidden bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                            <span className="text-slate-500 text-sm animate-pulse">Chargement…</span>
                        </div>
                    )}
                    {rendering && !loading && (
                        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center z-0 pointer-events-none">
                            <span className="text-slate-400 text-[10px] uppercase tracking-widest bg-white/80 px-2 py-1 rounded">Rendu...</span>
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full object-contain select-none pointer-events-none"
                        style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        aria-label={title}
                    />

                    {/* Paper texture overlay */}
                    <div className="paper-texture-overlay absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03]" />
                </div>
            </div>
        </div>
    );
}
