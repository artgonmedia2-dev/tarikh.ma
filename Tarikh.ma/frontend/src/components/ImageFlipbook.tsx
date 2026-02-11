/**
 * Image-based flipbook — pages served via signed URLs (Laravel stream + watermark).
 * Preloads current + next 2 pages; lazy loads the rest. Same flip UX as PDF viewer.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { documentPageSignedUrls } from '@/api/client';

export type ImageFlipbookProps = {
  documentId: string;
  totalPages: number;
  currentPage: number;
  onRequestPrev: () => void;
  onRequestNext: () => void;
  zoom?: number;
  title?: string;
  className?: string;
  flipPhase: 'out' | 'in' | null;
  flipDirection: 'next' | 'prev' | null;
  onFlipAnimationEnd: (e: React.AnimationEvent<HTMLDivElement>) => void;
  isFlipping: boolean;
};

const PRELOAD_AHEAD = 2;
const PRELOAD_BEHIND = 1;

// Page flip sound effect (base64 encoded short swoosh)
const FLIP_SOUND_DATA = 'data:audio/mp3;base64,//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kMQAD8AAADSAAAAANIAAADSAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
let flipAudioInstance: HTMLAudioElement | null = null;

function getFlipAudio(): HTMLAudioElement {
  if (!flipAudioInstance) {
    flipAudioInstance = new Audio(FLIP_SOUND_DATA);
    flipAudioInstance.volume = 0.25;
  }
  return flipAudioInstance;
}

function playFlipSound(): void {
  try {
    const audio = getFlipAudio();
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch {
    // Ignore audio errors (autoplay policy, etc.)
  }
}

function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

export function ImageFlipbook({
  documentId,
  totalPages,
  currentPage,
  onRequestPrev,
  onRequestNext,
  zoom = 100,
  title,
  className = '',
  flipPhase,
  flipDirection,
  onFlipAnimationEnd,
  isFlipping,
}: ImageFlipbookProps) {
  const [pageUrls, setPageUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestedRef = useRef<Set<number>>(new Set());

  const ensureUrls = useCallback(
    async (pages: number[]) => {
      const toRequest = pages.filter((p) => p >= 1 && p <= totalPages && !requestedRef.current.has(p));
      if (toRequest.length === 0) return;
      toRequest.forEach((p) => requestedRef.current.add(p));
      try {
        const urls = await documentPageSignedUrls(documentId, toRequest);
        setPageUrls((prev) => ({ ...prev, ...urls }));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [documentId, totalPages]
  );

  useEffect(() => {
    const from = Math.max(1, currentPage - PRELOAD_BEHIND);
    const to = Math.min(totalPages, currentPage + PRELOAD_AHEAD);
    ensureUrls(range(from, to));
  }, [documentId, currentPage, totalPages, ensureUrls]);

  const currentUrl = pageUrls[currentPage];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playFlipSound();
        onRequestPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        playFlipSound();
        onRequestNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onRequestPrev, onRequestNext]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded ${className}`} style={{ minHeight: 280 }}>
        <span className="text-slate-600 text-sm">Impossible de charger les pages.</span>
      </div>
    );
  }

  return (
    <div className={`cahier-viewer cahier-viewer-brochure relative w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden ${isFlipping ? 'is-flipping' : ''} ${className}`}>
      <button
        type="button"
        onClick={() => { playFlipSound(); onRequestPrev(); }}
        disabled={currentPage <= 1 || isFlipping}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105"
        aria-label="Page précédente"
      >
        <span className="material-symbols-outlined text-2xl sm:text-3xl font-light">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={() => { playFlipSound(); onRequestNext(); }}
        disabled={currentPage >= totalPages || isFlipping}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105"
        aria-label="Page suivante"
      >
        <span className="material-symbols-outlined text-2xl sm:text-3xl font-light">chevron_right</span>
      </button>
      <div role="button" tabIndex={0} onClick={() => { playFlipSound(); onRequestPrev(); }} onKeyDown={(e) => { if (e.key === 'Enter') { playFlipSound(); onRequestPrev(); } }} className="cahier-zone-prev" aria-label="Page précédente (zone)" aria-disabled={isFlipping} />
      <div role="button" tabIndex={0} onClick={() => { playFlipSound(); onRequestNext(); }} onKeyDown={(e) => { if (e.key === 'Enter') { playFlipSound(); onRequestNext(); } }} className="cahier-zone-next" aria-label="Page suivante (zone)" aria-disabled={isFlipping} />
      <div
        className={`cahier-page relative w-full h-full flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] max-h-[75vh] sm:max-h-[80vh] ${flipPhase && flipDirection ? `turn-${flipDirection}-${flipPhase}` : ''}`}
        onAnimationEnd={onFlipAnimationEnd}
      >
        <div className="cahier-page-inner absolute inset-0 flex items-center justify-center rounded overflow-hidden bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          {loading && !currentUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded">
              <span className="text-slate-500 text-sm">Chargement de la page…</span>
            </div>
          )}
          {currentUrl && (
            <img
              src={currentUrl}
              alt={title ? `Page ${currentPage} — ${title}` : `Page ${currentPage}`}
              className="max-w-full max-h-full w-auto h-auto object-contain select-none"
              style={{ transform: `scale(${zoom / 100})` }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>
      </div>
      {/* Preload next pages */}
      {[currentPage + 1, currentPage + 2].map((p) => {
        if (p > totalPages || !pageUrls[p]) return null;
        return <link key={p} rel="preload" as="image" href={pageUrls[p]} />;
      })}
    </div>
  );
}
