import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentsApi, themesApi, type DocumentItem } from '@/api/client';

export function Exploration() {
  const [data, setData] = useState<{ data: DocumentItem[]; current_page: number; last_page: number; total: number; per_page: number } | null>(null);
  const [themes, setThemes] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | ''>('');
  const [yearRange, setYearRange] = useState<[number, number]>([1500, 2024]);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title' | 'views' | 'year_asc' | 'year_desc'>('latest');

  useEffect(() => {
    themesApi.list().then(setThemes).catch(() => []);
  }, []);

  useEffect(() => {
    setLoading(true);
    documentsApi
      .list({
        page,
        per_page: 9,
        q: q || undefined,
        type: selectedTypes.length > 0 ? selectedTypes : undefined,
        theme_id: selectedThemeId || undefined,
        year_min: yearRange[0],
        year_max: yearRange[1],
        sort_by: sortBy,
      })
      .then((res) => setData(res))
      .catch(() => setData({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 9 }))
      .finally(() => setLoading(false));
  }, [page, q, selectedTypes, selectedThemeId, yearRange, sortBy]);

  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    setPage(1);
  };

  const resetFilters = () => {
    setQ('');
    setSelectedTypes([]);
    setSelectedThemeId('');
    setYearRange([1500, 2024]);
    setSortBy('latest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden paper-texture">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 pt-28 pb-12 relative z-10">
        {/* Superior Nav / Search Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-20">
          <div className="flex-1 w-full max-w-3xl relative group">
            <div className="absolute inset-0 bg-accent-gold/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-accent-gold text-2xl group-focus-within:text-accent-gold transition-colors z-10">search</span>
            <input
              type="text"
              placeholder="Rechercher un manuscrit, une ville, une date..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-white border-2 border-accent-gold/10 rounded-3xl pl-16 pr-8 py-6 text-slate-800 focus:outline-none focus:ring-4 focus:ring-accent-gold/5 focus:border-accent-gold/40 placeholder:text-slate-300 transition-all font-serif italic text-xl shadow-xl shadow-accent-gold/5 relative z-10"
            />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button className="px-10 py-5 rounded-3xl bg-accent-gold text-white font-bold text-sm hover:bg-accent-gold/90 hover:scale-105 transition-all shadow-2xl shadow-accent-gold/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Contribuer
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar FILTERS */}
          <aside className="lg:w-80 flex-shrink-0 space-y-12">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-slate-900 text-2xl font-black italic serif tracking-tight">Filtres <span className="text-accent-gold">Avancés</span></h2>
              <button
                onClick={resetFilters}
                className="text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-accent-gold transition-colors"
              >
                Réinitialiser
              </button>
            </div>

            {/* Période (Years Slider) */}
            <div className="space-y-6 bg-parchment/20 p-6 rounded-3xl border border-accent-gold/10">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Période Historique</label>
              <div className="px-2">
                <input
                  type="range"
                  min="1500"
                  max="2024"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                />
                <div className="flex justify-between mt-6 text-[11px] font-bold font-mono">
                  <span className="text-slate-400">1500</span>
                  <div className="bg-white px-3 py-1 rounded-full border border-accent-gold/20 shadow-sm">
                    <span className="text-accent-gold">Jusqu'à {yearRange[1]}</span>
                  </div>
                  <span className="text-slate-400">2024</span>
                </div>
              </div>
            </div>

            {/* Type de Document */}
            <div className="space-y-6">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nature des Archives</label>
              <div className="space-y-4">
                {[
                  { id: 'livre', label: 'Livres', icon: 'auto_stories' },
                  { id: 'pdf', label: 'Manuscrits', icon: 'menu_book' },
                  { id: 'video', label: 'Vidéos', icon: 'videocam' },
                  { id: 'carte', label: 'Cartes', icon: 'map' },
                  { id: 'image', label: 'Photos', icon: 'photo_library' },
                  { id: 'article', label: 'Articles', icon: 'article' },
                ].map(t => (
                  <label key={t.id} className="flex items-center gap-4 cursor-pointer group">
                    <div
                      onClick={() => toggleType(t.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedTypes.includes(t.id) ? 'bg-accent-gold border-accent-gold shadow-md shadow-accent-gold/20' : 'border-slate-200 bg-white group-hover:border-accent-gold/50'}`}
                    >
                      {selectedTypes.includes(t.id) && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
                    </div>
                    <span className={`text-sm transition-colors ${selectedTypes.includes(t.id) ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-700'}`}>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Thématique tags */}
            <div className="space-y-6">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Thématiques Populaires</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedThemeId('')}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-bold border transition-all ${selectedThemeId === '' ? 'bg-accent-gold border-accent-gold text-white shadow-lg shadow-accent-gold/20' : 'bg-white border-slate-100 text-slate-500 hover:border-accent-gold/30 hover:text-accent-gold'}`}
                >
                  Toutes
                </button>
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`px-5 py-2.5 rounded-full text-[11px] font-bold border transition-all ${selectedThemeId === t.id ? 'bg-accent-gold border-accent-gold text-white shadow-lg shadow-accent-gold/20' : 'bg-white border-slate-100 text-slate-500 hover:border-accent-gold/30 hover:text-accent-gold'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN Content area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-100">
              <div>
                <h2 className="text-3xl font-black text-slate-900 italic serif tracking-tight">
                  Résultats {q && <span>pour <span className="text-accent-gold">&quot;{q}&quot;</span></span>}
                </h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  <span className="text-accent-gold font-bold">{data?.total || 0}</span> documents précieux extraits de l&apos;inventaire national.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-accent-gold/30 cursor-pointer shadow-sm"
                >
                  <option value="latest">Dernières Acquisitions</option>
                  <option value="oldest">Trésors les plus anciens</option>
                  <option value="views">Les plus consultés</option>
                  <option value="title">Ordre Alphabétique</option>
                  <option value="year_asc">Chronologie (Croissante)</option>
                  <option value="year_desc">Chronologie (Décroissante)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-[2.5rem] h-[480px] animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {data.data.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(126,96,80,0.12)] hover:border-accent-gold/20 hover:-translate-y-3 transition-all duration-700 flex flex-col h-full relative"
                    >
                      <div className="h-64 relative overflow-hidden m-4 rounded-[2rem]">
                        {doc.thumbnail_url ? (
                          <img src={doc.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-parchment/30 flex items-center justify-center grayscale opacity-60">
                            <span className="material-symbols-outlined text-7xl text-accent-gold/20">auto_stories</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute top-6 left-6">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-accent-gold/10 flex items-center justify-center text-accent-gold shadow-lg group-hover:bg-accent-gold group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-2xl">
                              {doc.type === 'pdf' ? 'menu_book' : doc.type === 'image' ? 'image' : doc.type === 'carte' ? 'map' : 'description'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 pt-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-5">
                          <span className="px-3 py-1 bg-accent-gold/5 text-[9px] font-black text-accent-gold rounded-full uppercase tracking-widest">{doc.region?.name || 'Royaume'}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{doc.year || '—'} AP. J.-C.</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-accent-gold transition-colors line-clamp-2 serif leading-snug">
                          {doc.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8 font-medium italic serif">
                          {doc.description || "Une pièce historique d'une importance capitale pour la compréhension de l'évolution structurelle et culturelle du Royaume."}
                        </p>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono">ID: TK-{doc.id.toString().padStart(5, '0')}</span>
                          <div className="flex items-center gap-2 text-accent-gold text-xs font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-500">
                            Lire la suite <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination components */}
                {data.last_page > 1 && (
                  <div className="mt-24 flex justify-center items-center gap-3">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:border-accent-gold hover:text-accent-gold hover:shadow-xl hover:shadow-accent-gold/10 transition-all disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined text-2xl">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-14 h-14 rounded-2xl font-black text-sm transition-all shadow-sm ${page === p ? 'bg-accent-gold text-white shadow-xl shadow-accent-gold/30 scale-110' : 'bg-white border border-slate-100 text-slate-500 hover:border-accent-gold hover:text-accent-gold'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {data.last_page > 5 && <span className="text-slate-300 px-2 font-black">...</span>}
                    <button
                      onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                      disabled={page >= data.last_page}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:border-accent-gold hover:text-accent-gold hover:shadow-xl hover:shadow-accent-gold/10 transition-all disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined text-2xl">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-48 bg-parchment/10 rounded-[4rem] border-4 border-dashed border-slate-100">
                <div className="w-24 h-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center text-accent-gold/30 mb-8 border border-accent-gold/5">
                  <span className="material-symbols-outlined text-5xl">history_edu</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 serif italic">Le silence des manuscrits...</h3>
                <p className="text-slate-400 text-base font-medium max-w-md text-center leading-relaxed">Nous n&apos;avons trouvé aucune pièce correspondant à vos critères dans nos registres actuels.</p>
                <button
                  onClick={resetFilters}
                  className="mt-10 px-8 py-3 bg-white border border-accent-gold/20 text-accent-gold rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-gold hover:text-white transition-all shadow-lg shadow-accent-gold/5"
                >
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer minimal signature */}
      <footer className="max-w-[1600px] mx-auto px-6 py-16 border-t border-slate-50 mt-24 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          <span>© 2026 Tarikh.ma - Tous droits réservé. Developped by ArtgonMEDIA</span>
        </div>
        <div className="flex gap-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Portail Officiel</a>
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Archives Numériques</a>
        </div>
      </footer>
    </div>
  );
}
