import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { documentsApi, documentStreamUrl, type DocumentItem } from '@/api/client';
import { ImageFlipbook } from '@/components/ImageFlipbook';
import { PdfJsFlipbook } from '@/components/PdfJsFlipbook';

function formatDate(year: number | string | null | undefined): string {
  if (year == null) return '—';
  if (typeof year === 'string') return year;
  return String(year);
}

export function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [similar, setSimilar] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [pdfPage, setPdfPage] = useState(1);
  const [flipPhase, setFlipPhase] = useState<'out' | 'in' | null>(null);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfFetchError, setPdfFetchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPdf = document?.type === 'pdf';
  const isFlipping = flipPhase !== null;
  const useImageFlipbook = isPdf && (document?.pages_status === 'completed' && (document?.pages_count ?? 0) > 0);
  const usePdfJsFlipbook = isPdf && !useImageFlipbook; // Use PDF.js when server conversion not available
  const totalPdfPages = useImageFlipbook ? (document?.pages_count ?? 1) : 0;
  const [pdfJsTotalPages, setPdfJsTotalPages] = useState(0);

  useEffect(() => {
    if (document) (window.document.title = `${document.title} — Tarikh.ma`);
    return () => { window.document.title = 'Tarikh.ma'; };
  }, [document?.title]);

  useEffect(() => {
    if (!id) return;
    setPdfPage(1);
    setPdfBlobUrl(null);
    setFlipPhase(null);
    setFlipDirection(null);
    documentsApi
      .get(id)
      .then((res) => {
        setDocument(res.document);
        setSimilar(res.similar ?? []);
      })
      .catch(() => setDocument(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Charger le PDF en blob pour affichage inline (évite le téléchargement automatique du navigateur)
  useEffect(() => {
    if (!document || document.type !== 'pdf') {
      setPdfBlobUrl(null);
      return;
    }
    const streamUrl = documentStreamUrl(String(document.id));
    setPdfBlobUrl(null);
    let blobUrl: string | null = null;
    let revoked = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    fetch(streamUrl, {
      mode: 'cors',
      signal: controller.signal
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        return res.blob();
      })
      .then((blob) => {
        if (revoked) return;
        const url = URL.createObjectURL(blob);
        blobUrl = url;
        setPdfBlobUrl(url);
        setPdfFetchError(null);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (revoked) return;

        let message = "Erreur de connexion au serveur";
        if (err.name === 'AbortError') {
          message = "Le chargement a pris trop de temps (timeout 30s). Vérifiez votre connexion.";
        } else if (err.message) {
          message = err.message;
        }

        console.error('[DocumentView] PDF fetch failed:', err);
        setPdfFetchError(message);
      });
    return () => {
      revoked = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setPdfBlobUrl(null);
    };
  }, [document?.id, document?.type]);

  // pdfPage change logic (no longer needs pdfLoaded)

  /* Page flip (real book feel): machine à états out → in → null.
   * out = page actuelle glisse (slide), in = nouvelle page entre. Fallback timer si animationend absent (iframe PDF). */
  const FLIP_DURATION_MS = 500;
  const flipFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFlipAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    console.log(`[Flip] Animation end Phase:${flipPhase} Page:${pdfPage}`);
    if (flipPhase === 'out') {
      const nextPage = flipDirection === 'next' ? pdfPage + 1 : pdfPage - 1;
      console.log(`[Flip] Moving to page ${nextPage}, phase -> IN`);
      setPdfPage(nextPage);
      setFlipPhase('in');
    } else if (flipPhase === 'in') {
      console.log(`[Flip] Phase IN finished -> NULL`);
      setFlipPhase(null);
      setFlipDirection(null);
    }
  };

  /** Fallback timer si animationend ne se déclenche pas */
  useEffect(() => {
    if (flipPhase === null) {
      if (flipFallbackRef.current) {
        clearTimeout(flipFallbackRef.current);
        flipFallbackRef.current = null;
      }
      return;
    }

    const phase = flipPhase;
    const dir = flipDirection;
    const page = pdfPage;

    flipFallbackRef.current = setTimeout(() => {
      if (flipFallbackRef.current) {
        console.warn(`[Flip] Fallback triggered for phase ${phase}`);
        flipFallbackRef.current = null;
        if (phase === 'out') {
          const nextPage = dir === 'next' ? page + 1 : page - 1;
          setPdfPage(nextPage);
          setFlipPhase('in');
        } else {
          setFlipPhase(null);
          setFlipDirection(null);
        }
      }
    }, FLIP_DURATION_MS + 200);

    return () => {
      if (flipFallbackRef.current) {
        clearTimeout(flipFallbackRef.current);
        flipFallbackRef.current = null;
      }
    };
  }, [flipPhase, flipDirection, pdfPage]);

  const goPrevPage = () => {
    const canGo = pdfPage > 1 && !isFlipping;
    console.log(`[Nav] Prev clicked. Page:${pdfPage} isFlipping:${isFlipping} CanGo:${canGo}`);
    if (!canGo) return;
    setFlipDirection('prev');
    setFlipPhase('out');
  };

  const goNextPage = () => {
    const total = useImageFlipbook ? totalPdfPages : pdfJsTotalPages;
    const canGo = pdfPage < total && !isFlipping;
    console.log(`[Nav] Next clicked. Page:${pdfPage}/${total} isFlipping:${isFlipping} CanGo:${canGo}`);
    if (!canGo) return;
    setFlipDirection('next');
    setFlipPhase('out');
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isPdf) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNextPage();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPdf, pdfPage, pdfJsTotalPages, totalPdfPages, isFlipping]); // Correct dependencies

  // Bloquer copier/coller quand la sélection ou le focus est dans la visionneuse (Read Online)
  useEffect(() => {
    if (!document) return; // pas de viewer monté tant qu'on n'a pas le document
    const container = containerRef.current;
    if (!container) return;
    const preventIfInViewer = (e: ClipboardEvent) => {
      try {
        const sel = window.document.getSelection();
        const inViewer =
          container.contains(window.document.activeElement as Node) ||
          (sel?.anchorNode && container.contains(sel.anchorNode));
        if (inViewer) {
          e.preventDefault();
          e.stopPropagation();
        }
      } catch {
        e.preventDefault();
      }
    };
    const preventKey = (e: KeyboardEvent) => {
      if (!container.contains(window.document.activeElement as Node)) return;
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 'a')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.document.addEventListener('copy', preventIfInViewer, true);
    window.document.addEventListener('cut', preventIfInViewer, true);
    window.document.addEventListener('paste', preventIfInViewer, true);
    window.document.addEventListener('keydown', preventKey, true);
    return () => {
      window.document.removeEventListener('copy', preventIfInViewer, true);
      window.document.removeEventListener('cut', preventIfInViewer, true);
      window.document.removeEventListener('paste', preventIfInViewer, true);
      window.document.removeEventListener('keydown', preventKey, true);
    };
  }, [document]);

  const regionName = document?.region?.name ?? '';

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 z-50 shrink-0">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <span className="text-accent-gold material-symbols-outlined text-xl sm:text-2xl">auto_stories</span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Tarikh.ma</h2>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input className="bg-slate-100 border-none rounded-lg pl-9 pr-3 py-2 text-sm w-44 lg:w-64" placeholder="Rechercher..." type="text" readOnly />
            </div>
            <Link to="/login" className="bg-accent-gold text-white text-sm font-bold px-4 py-2 sm:px-5 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent-gold/20 whitespace-nowrap">
              Mon Compte
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0">
          <div className="flex-1 flex items-center justify-center bg-slate-100 min-h-[60vh]">
            <span className="text-slate-500">Chargement…</span>
          </div>
          <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 hidden lg:block animate-pulse shrink-0" />
        </main>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 z-50 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-primary material-symbols-outlined text-2xl">auto_stories</span>
            <h2 className="text-xl font-bold text-slate-900">Tarikh.ma</h2>
          </Link>
          <Link to="/archives" className="text-primary font-semibold">Retour aux archives</Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-12 min-h-0">
          <div className="text-center">
            <p className="text-slate-600">Document introuvable.</p>
            <Link to="/archives" className="text-accent-gold font-semibold mt-4 inline-block hover:underline">
              Retour aux archives
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const streamUrl = documentStreamUrl(String(document.id));
  const isImage = document.type === 'image';
  const isVideo = document.type === 'video';
  const isAudio = document.type === 'audio';
  const showViewer = isPdf || isImage || isVideo || isAudio;

  const preventDownload = (e: React.MouseEvent) => e.preventDefault();
  const preventCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const preventCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const preventPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const preventKeyCopy = (e: React.KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 'a')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* Header — responsive: empiler / réduire sur petit écran */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 z-50 shrink-0">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-accent-gold">
              <span className="material-symbols-outlined text-xl sm:text-2xl">auto_stories</span>
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">Tarikh.ma</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-500 min-w-0">
            <Link to="/archives" className="hover:text-accent-gold px-2 transition-colors shrink-0">Archives</Link>
            {regionName && (
              <>
                <span className="material-symbols-outlined text-xs shrink-0">chevron_right</span>
                <Link to="/archives" className="hover:text-accent-gold px-2 transition-colors truncate max-w-[120px]">{regionName}</Link>
              </>
            )}
            <span className="material-symbols-outlined text-xs shrink-0">chevron_right</span>
            <span className="text-slate-900 truncate max-w-[140px] lg:max-w-[200px]" title={document.title}>{document.title}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input className="bg-slate-100 border-none rounded-lg pl-9 pr-3 py-2 text-sm w-44 lg:w-64 focus:ring-2 focus:ring-accent-gold/40 transition-all" placeholder="Rechercher..." type="text" readOnly />
          </div>
          <Link to="/login" className="bg-accent-gold text-white text-sm font-bold px-4 py-2 sm:px-5 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent-gold/20 whitespace-nowrap">
            Mon Compte
          </Link>
        </div>
      </header>

      {/* Main — viewer à gauche, sidebar à droite ; mobile: scroll vertical, desktop: overflow hidden */}
      <main className="flex flex-1 flex-col lg:flex-row overflow-auto lg:overflow-hidden relative min-h-0">
        {/* Zone visionneuse — style brochure : fond blanc, flèches sur les bords, indicateur centré */}
        <div className="flex-1 flex flex-col bg-[#fcfaf7] relative group min-w-0 min-h-[60vh] lg:min-h-0 border-b border-slate-200 lg:border-b-0 lg:border-r border-slate-200">
          {/* Badge Lecture en ligne uniquement — style clair */}
          <div className="absolute top-3 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/95 shadow-sm border border-accent-gold/20">
            <span className="material-symbols-outlined text-accent-gold text-lg">visibility</span>
            <span className="text-slate-700 text-xs font-semibold uppercase tracking-wider">Lecture en ligne uniquement</span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">· Copier/coller désactivé</span>
          </div>
          {/* Toolbar discrète — survol desktop */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white/90 shadow-sm border border-slate-200/80 p-1 rounded-lg z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <button type="button" onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors" aria-label="Zoom avant">
              <span className="material-symbols-outlined text-lg">zoom_in</span>
            </button>
            <button type="button" onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors" aria-label="Zoom arrière">
              <span className="material-symbols-outlined text-lg">zoom_out</span>
            </button>
            <div className="w-px h-5 bg-slate-200 mx-0.5" />
            <button type="button" onClick={() => containerRef.current?.requestFullscreen?.()} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors" aria-label="Plein écran">
              <span className="material-symbols-outlined text-lg">fullscreen</span>
            </button>
          </div>

          {/* Zone document — pas de téléchargement, pas de copier-coller */}
          <div
            className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-auto custom-scrollbar relative min-h-0 select-none no-download no-copy bg-[#fcfaf7]"
            ref={containerRef}
            onContextMenu={preventDownload}
            onCopy={preventCopy}
            onCut={preventCut}
            onPaste={preventPaste}
            onKeyDown={preventKeyCopy}
          >
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-b from-transparent via-transparent to-slate-100/50 z-10" aria-hidden />
            <div className="relative z-0 flex flex-col items-center justify-center w-full h-full" style={{ userSelect: 'none', pointerEvents: showViewer ? 'auto' : 'none' }}>
              {useImageFlipbook && (
                <>
                  <ImageFlipbook
                    documentId={String(document.id)}
                    totalPages={totalPdfPages}
                    currentPage={pdfPage}
                    onRequestPrev={goPrevPage}
                    onRequestNext={goNextPage}
                    zoom={zoom}
                    title={document.title}
                    flipPhase={flipPhase}
                    flipDirection={flipDirection}
                    onFlipAnimationEnd={handleFlipAnimationEnd}
                    isFlipping={isFlipping}
                  />
                  <div className="flex items-center justify-center py-3 px-4 border-t border-slate-200/80 bg-white/50 shrink-0">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
                      {document.title.length > 28 ? `${document.title.slice(0, 26)}…` : document.title}
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-slate-700 font-semibold tracking-normal">{pdfPage}</span>
                      {totalPdfPages > 0 && <span className="text-slate-400 font-normal"> / {totalPdfPages}</span>}
                    </span>
                  </div>
                </>
              )}
              {usePdfJsFlipbook && (
                <>
                  {pdfBlobUrl ? (
                    <PdfJsFlipbook
                      pdfUrl={pdfBlobUrl}
                      currentPage={pdfPage}
                      onRequestPrev={goPrevPage}
                      onRequestNext={goNextPage}
                      onTotalPagesChange={setPdfJsTotalPages}
                      onPageChange={setPdfPage}
                      zoom={zoom}
                      title={document.title}
                      flipPhase={flipPhase}
                      flipDirection={flipDirection}
                      onFlipAnimationEnd={handleFlipAnimationEnd}
                      isFlipping={isFlipping}
                    />
                  ) : pdfFetchError ? (
                    <div className="flex-1 flex items-center justify-center bg-white shadow-sm rounded min-h-[50vh] w-full max-w-2xl px-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                        <p className="text-slate-600 font-medium">Échec de la préparation du document</p>
                        <p className="text-slate-400 text-xs">{pdfFetchError}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 text-accent-gold text-sm font-bold hover:underline"
                        >
                          Réessayer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-white shadow-sm rounded min-h-[50vh] w-full max-w-2xl">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin" />
                        <span className="text-slate-500 text-sm animate-pulse">Préparation du document sécurisé...</span>
                      </div>
                    </div>
                  )}
                  {/* Indicateur centré style brochure : Document | Page N */}
                  <div className="flex items-center justify-center py-3 px-4 border-t border-slate-200/80 bg-white/50 shrink-0">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
                      {document.title.length > 28 ? `${document.title.slice(0, 26)}…` : document.title}
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-slate-700 font-semibold tracking-normal">{pdfPage}</span>
                      {pdfJsTotalPages > 0 && <span className="text-slate-400 font-normal"> / {pdfJsTotalPages}</span>}
                    </span>
                  </div>
                </>
              )}
              {isImage && (
                <div className="relative shadow-[0_0_100px_rgba(17,82,212,0.15)] rounded-sm border border-white/5 transition-transform duration-500" onContextMenu={preventDownload}>
                  <img
                    src={streamUrl}
                    alt={document.title}
                    className="max-h-[70vh] sm:max-h-[80vh] w-auto select-none pointer-events-none rounded-sm"
                    style={{ transform: `scale(${zoom / 100})` }}
                    draggable={false}
                    loading="lazy"
                    onContextMenu={preventDownload}
                  />
                  <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-accent-gold/40 rounded-tl" />
                  <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-accent-gold/40 rounded-tr" />
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-accent-gold/40 rounded-bl" />
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-accent-gold/40 rounded-br" />
                </div>
              )}
              {isVideo && (
                <video src={streamUrl} controls className="max-w-full max-h-[70vh] sm:max-h-[80vh] rounded" controlsList="nodownload noremoteplayback" disablePictureInPicture />
              )}
              {isAudio && (
                <div className="w-full max-w-md px-4">
                  <audio src={streamUrl} controls className="w-full" controlsList="nodownload noremoteplayback" />
                </div>
              )}
              {!showViewer && (
                <div className="text-center text-slate-500 px-4">
                  <span className="material-symbols-outlined text-5xl sm:text-6xl block mb-4 text-slate-400">description</span>
                  <p className="text-sm sm:text-base">Aperçu non disponible pour ce type. Consultation en lecture seule uniquement.</p>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Documents similaires — responsive */}
          {similar.length > 0 && (
            <div className="bg-slate-100 border-t border-slate-200 p-3 sm:p-4 h-40 sm:h-48 overflow-hidden shrink-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3 px-1 sm:px-2">
                <h3 className="text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Documents similaires</h3>
                <div className="flex gap-1 sm:gap-2">
                  <button type="button" className="text-slate-500 hover:text-primary transition-colors p-1" aria-label="Précédent">
                    <span className="material-symbols-outlined text-base sm:text-lg">arrow_back_ios</span>
                  </button>
                  <button type="button" className="text-slate-500 hover:text-primary transition-colors p-1" aria-label="Suivant">
                    <span className="material-symbols-outlined text-base sm:text-lg">arrow_forward_ios</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto custom-scrollbar pb-2 scrollbar-hide touch-scroll">
                {similar.map((doc) => (
                  <Link key={doc.id} to={`/documents/${doc.id}`} className="flex-shrink-0 w-24 sm:w-32 group/card cursor-pointer">
                    <div className="aspect-[3/4] rounded-md overflow-hidden bg-slate-200 border border-slate-200 group-hover/card:border-accent-gold/50 transition-all">
                      {doc.thumbnail_url || doc.type === 'image' ? (
                        <img
                          src={doc.thumbnail_url || documentStreamUrl(String(doc.id))}
                          alt=""
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-full h-full object-cover grayscale opacity-80 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-500 bg-slate-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-400 text-4xl">
                            {doc.type === 'pdf' ? 'description' : doc.type === 'video' ? 'videocam' : 'image'}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 sm:mt-2 truncate group-hover/card:text-accent-gold transition-colors">{doc.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar droite — fond blanc, responsive padding */}
        <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col z-30 custom-scrollbar overflow-y-auto shrink-0 lg:min-h-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 text-accent-gold mb-2">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Document Certifié</span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight text-slate-900">{document.title}</h1>
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>{document.views_count || '1,284'} vues</span>
              </div>
              <button type="button" onClick={() => navigator.clipboard.writeText(window.location.href)} className="text-slate-400 hover:text-accent-gold transition-colors" aria-label="Partager">
                <span className="material-symbols-outlined">share</span>
              </button>
              <button type="button" className="text-slate-400 hover:text-red-500 transition-colors" aria-label="Favoris">
                <span className="material-symbols-outlined">favorite</span>
              </button>
            </div>
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Description</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic line-clamp-4 sm:line-clamp-none">
                  {document.description ?? 'Aucune description disponible.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Thème</p>
                  <p className="text-sm font-medium text-slate-900">{document.theme?.name ?? '—'}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Région</p>
                  <p className="text-sm font-medium text-slate-900">{document.region?.name ?? '—'}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Date</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(document.year)}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Auteur</p>
                  <p className="text-sm font-medium text-slate-900">{document.author ?? '—'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Actions de recherche</h4>
                <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group">
                  <span className="text-sm font-medium text-slate-800">Provenance & Histoire</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-accent-gold transition-colors">history</span>
                </button>
                <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group">
                  <span className="text-sm font-medium text-slate-800">Citer le document</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-accent-gold transition-colors">format_quote</span>
                </button>
                <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group">
                  <span className="text-sm font-medium text-slate-800">Signaler une erreur</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-accent-gold transition-colors">flag</span>
                </button>
              </div>
            </div>
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl bg-accent-gold/5 border border-accent-gold/10">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-accent-gold">lock</span>
                <h5 className="text-sm font-bold text-slate-900">Lecture Sécurisée</h5>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ce document est protégé par le droit d&apos;auteur patrimonial. Le téléchargement est désactivé pour garantir la préservation numérique.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
