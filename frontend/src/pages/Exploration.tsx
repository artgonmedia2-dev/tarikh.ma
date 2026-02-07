import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentsApi, themesApi, regionsApi, type DocumentItem } from '@/api/client';

export function Exploration() {
  const [data, setData] = useState<{ data: DocumentItem[]; current_page: number; last_page: number; total: number; per_page: number } | null>(null);
  const [themes, setThemes] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [regions, setRegions] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [themeId, setThemeId] = useState<number | ''>('');
  const [regionId, setRegionId] = useState<number | ''>('');
  const [year, setYear] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    themesApi.list().then(setThemes).catch(() => []);
    regionsApi.list().then(setRegions).catch(() => []);
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
        region_id: regionId || undefined,
        year: year || undefined,
        language: language || undefined,
      })
      .then((res) => setData(res))
      .catch(() => setData({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 12 }))
      .finally(() => setLoading(false));
  }, [page, q, type, themeId, regionId, year, language]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Exploration des archives</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{data ? `${data.total} document(s)` : 'Chargement…'}</p>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 flex-shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recherche</label>
            <input
              type="search"
              placeholder="Mot-clé, ville, date..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Tous</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="carte">Carte</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thématique</label>
            <select
              value={themeId}
              onChange={(e) => { setThemeId(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Toutes</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Région</label>
            <select
              value={regionId}
              onChange={(e) => { setRegionId(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Toutes</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Année / Période</label>
            <input
              type="text"
              placeholder="ex. 1920 ou 1920-1930"
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Langue</label>
            <input
              type="text"
              placeholder="ex. arabe, français"
              value={language}
              onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
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
                    className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-0.5"
                  >
                    <div className="h-48 bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                      {doc.thumbnail_url ? (
                        <img src={doc.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <span className="text-5xl text-slate-400" aria-hidden>📄</span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{doc.type}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-1 group-hover:text-primary transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{doc.year ?? '—'} — {doc.region?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400 mt-1">{doc.views_count} vues</p>
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
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Aucun document pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
