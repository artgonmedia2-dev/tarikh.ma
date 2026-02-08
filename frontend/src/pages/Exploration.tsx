import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentsApi, themesApi, type DocumentItem } from '@/api/client';

export function Exploration() {
  const [data, setData] = useState<{ data: DocumentItem[]; current_page: number; last_page: number; total: number; per_page: number } | null>(null);
  const [themes, setThemes] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [themeId, setThemeId] = useState<number | ''>('');

  useEffect(() => {
    themesApi.list().then(setThemes).catch(() => []);
  }, []);

  useEffect(() => {
    setLoading(true);
    documentsApi
      .list({
        page,
        per_page: 12,
        q: q || undefined,
        type: type || undefined,
        theme_id: themeId || undefined,
      })
      .then((res) => setData(res))
      .catch(() => setData({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 12 }))
      .finally(() => setLoading(false));
  }, [page, q, type, themeId]);

  return (
    <div className="min-h-screen bg-parchment paper-texture zellij-pattern">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2 serif vintage-text-shadow italic">Exploration des Archives</h1>
          <div className="h-1 w-20 bg-accent-gold rounded-full mb-4" />
          <p className="text-slate-600 serif">{data ? `${data.total} manuscrits & documents répertoriés` : 'Chargement de la bibliothèque…'}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-xl border border-accent-gold/20 p-5 shadow-sm">
              <label className="block text-[10px] font-black text-accent-gold uppercase tracking-[0.2em] mb-3">Recherche</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-accent-gold text-lg">search</span>
                <input
                  type="search"
                  placeholder="Mot-clé, ville, date..."
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  className="w-full bg-parchment/50 border-0 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none serif"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-accent-gold/20 p-5 shadow-sm">
              <label className="block text-[10px] font-black text-accent-gold uppercase tracking-[0.2em] mb-3">Filtrer par Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className="w-full bg-parchment/50 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none serif"
              >
                <option value="">Tous les formats</option>
                <option value="pdf">Manuscrits (PDF)</option>
                <option value="image">Illustrations</option>
                <option value="carte">Cartes Anciennes</option>
              </select>
            </div>
            <div className="bg-white rounded-xl border border-accent-gold/20 p-5 shadow-sm">
              <label className="block text-[10px] font-black text-accent-gold uppercase tracking-[0.2em] mb-3">Thématique</label>
              <select
                value={themeId}
                onChange={(e) => { setThemeId(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                className="w-full bg-parchment/50 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none serif"
              >
                <option value="">Toutes les thématiques</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.data.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="group bg-white rounded-xl border border-accent-gold/10 overflow-hidden hover:shadow-2xl hover:shadow-accent-gold/10 transition-all hover:-translate-y-1"
                    >
                      <div className="h-48 bg-parchment flex items-center justify-center relative overflow-hidden border-b border-accent-gold/5">
                        {doc.thumbnail_url ? (
                          <img src={doc.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <span className="text-5xl opacity-40 grayscale" aria-hidden>📜</span>
                        )}
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">{doc.type}</span>
                        <h3 className="font-bold text-slate-900 mt-1 group-hover:text-primary transition-colors line-clamp-2 serif">
                          {doc.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-2 font-medium">{doc.year ?? '—'} &bull; {doc.region?.name ?? 'Le Royaume'}</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                          <span className="text-[10px] text-slate-400">{doc.views_count} consultations</span>
                          <span className="text-primary material-symbols-outlined text-sm">visibility</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {data.last_page > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:border-primary"
                    >
                      Précédent
                    </button>
                    <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
                      Page {data.current_page} / {data.last_page}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                      disabled={page >= data.last_page}
                      className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:border-primary"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-slate-600 serif italic bg-white/40 rounded-2xl border-2 border-dashed border-accent-gold/20">
                Aucun manuscrit trouvé pour cette recherche.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
