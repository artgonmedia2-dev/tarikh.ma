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
    <div className="min-h-screen bg-[#0a0c10] text-parchment relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 py-12 relative z-10">
        {/* Superior Nav / Search Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex-1 w-full max-w-2xl relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Rechercher un manuscrit, une ville, une date..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 placeholder:text-slate-500 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 rounded-2xl bg-accent-gold text-background-dark font-bold text-sm hover:scale-105 transition-transform">
              Contribuer
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar FILTERS */}
          <aside className="lg:w-80 flex-shrink-0 space-y-10">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-accent-gold text-xl font-black italic serif tracking-tight">Filtres Avancés</h2>
              <button
                onClick={resetFilters}
                className="text-[10px] uppercase tracking-widest font-black text-slate-500 hover:text-white transition-colors"
              >
                Réinitialiser
              </button>
            </div>

            {/* Période (Years Slider) */}
            <div className="space-y-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Période (Années)</label>
              <div className="px-2">
                <input
                  type="range"
                  min="1500"
                  max="2024"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                />
                <div className="flex justify-between mt-4 text-[11px] font-bold font-mono text-slate-500">
                  <span>{yearRange[0]}</span>
                  <span className="text-accent-gold px-2 py-0.5 bg-accent-gold/10 rounded border border-accent-gold/20">{yearRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Type de Document */}
            <div className="space-y-4 text-sm">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type de Document</label>
              <div className="space-y-3">
                {[
                  { id: 'pdf', label: 'Textes & Manuscrits', icon: 'menu_book' },
                  { id: 'image', label: 'Images & Gravures', icon: 'image' },
                  { id: 'carte', label: 'Cartographie', icon: 'map' },
                  { id: 'video', label: 'Archives Vidéo', icon: 'videocam' },
                  { id: 'audio', label: 'Enregistrements Audio', icon: 'audio_file' },
                ].map(t => (
                  <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleType(t.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedTypes.includes(t.id) ? 'bg-accent-gold border-accent-gold' : 'border-white/20 group-hover:border-white/40'}`}
                    >
                      {selectedTypes.includes(t.id) && <span className="material-symbols-outlined text-background-dark text-[14px] font-bold">check</span>}
                    </div>
                    <span className={`transition-colors ${selectedTypes.includes(t.id) ? 'text-white font-medium' : 'text-slate-400'}`}>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Thématique tags */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thématique</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedThemeId('')}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${selectedThemeId === '' ? 'bg-accent-gold border-accent-gold text-background-dark shadow-lg shadow-accent-gold/20' : 'border-white/10 text-slate-400 hover:border-white/30'}`}
                >
                  Tous
                </button>
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${selectedThemeId === t.id ? 'bg-accent-gold border-accent-gold text-background-dark shadow-lg shadow-accent-gold/20' : 'border-white/10 text-slate-400 hover:border-white/30'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN Content area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-black text-white italic serif tracking-tight">
                  Résultats {q && <span>pour <span className="text-accent-gold">&quot;{q}&quot;</span></span>}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{data?.total || 0} documents trouvés dans l&apos;inventaire national.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-accent-gold/50 cursor-pointer"
                >
                  <option value="latest">Nouveautés</option>
                  <option value="oldest">Les plus anciens</option>
                  <option value="views">Popularité</option>
                  <option value="title">Alphabétique (A-Z)</option>
                  <option value="year_asc">Année (Croissant)</option>
                  <option value="year_desc">Année (Décroissant)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-900/40 rounded-3xl h-[450px] animate-pulse relative overflow-hidden border border-white/5" />
                ))}
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {data.data.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="group bg-slate-900/40 rounded-3xl border border-white/10 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-accent-gold/30 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative"
                    >
                      <div className="h-60 relative overflow-hidden">
                        {doc.thumbnail_url ? (
                          <img src={doc.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center grayscale opacity-50">
                            <span className="material-symbols-outlined text-6xl text-accent-gold/20">auto_stories</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] to-transparent opacity-60" />

                        <div className="absolute top-4 left-4">
                          <div className="w-10 h-10 rounded-2xl bg-accent-gold flex items-center justify-center text-background-dark shadow-xl">
                            <span className="material-symbols-outlined text-xl font-bold">
                              {doc.type === 'pdf' ? 'menu_book' : doc.type === 'image' ? 'image' : doc.type === 'carte' ? 'map' : 'description'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em]">{doc.region?.name || 'Rabat'}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{doc.year || '1200'} AP. J.-C.</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent-gold transition-colors line-clamp-2 serif">
                          {doc.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
                          {doc.description || "Analyse structurelle des caractères géométriques utilisés dans les manuscrits impériaux du Royaume à travers les époques."}
                        </p>

                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ID: TK-{doc.id.toString().padStart(5, '0')}</span>
                          <div className="flex items-center gap-2 text-accent-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Consulter <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination components */}
                {data.last_page > 1 && (
                  <div className="mt-20 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 text-slate-500 hover:border-accent-gold hover:text-accent-gold transition-all disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${page === p ? 'bg-accent-gold text-background-dark shadow-lg shadow-accent-gold/20 scale-110' : 'border border-white/10 text-slate-500 hover:border-white/30 hover:text-white'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {data.last_page > 5 && <span className="text-slate-600 px-2 font-black">...</span>}
                    {data.last_page > 5 && (
                      <button
                        onClick={() => setPage(data.last_page)}
                        className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${page === data.last_page ? 'bg-accent-gold text-background-dark' : 'border border-white/10 text-slate-500'}`}
                      >
                        {data.last_page}
                      </button>
                    )}
                    <button
                      onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                      disabled={page >= data.last_page}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 text-slate-500 hover:border-accent-gold hover:text-accent-gold transition-all disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 bg-slate-900/20 rounded-[40px] border-2 border-dashed border-white/5">
                <div className="w-20 h-20 rounded-full bg-slate-900/50 flex items-center justify-center text-slate-700 mb-6">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 serif italic">Le silence des archives...</h3>
                <p className="text-slate-500 text-sm">Aucun manuscrit ne correspond à votre recherche actuelle.</p>
                <button
                  onClick={resetFilters}
                  className="mt-8 text-accent-gold text-xs font-black uppercase tracking-widest hover:underline"
                >
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer minimal signature */}
      <footer className="max-w-[1600px] mx-auto px-6 py-12 border-t border-white/5 mt-20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          <span>© 2024 Tarikh.ma</span>
          <span>Direction des Archives Royales</span>
        </div>
        <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          <a href="#" className="hover:text-accent-gold transition-colors">Mentions Légales</a>
          <a href="#" className="hover:text-accent-gold transition-colors">Confidentialité</a>
        </div>
      </footer>
    </div>
  );
}
