import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type StatsResponse } from '@/api/client';

const MOROCCO_MAP_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBn_NnEt4bFo_o0yfA9_SPDod599m_ZmfIICE430YfnJ7WmtU_XSKuJeUnmt7swSSF2z3Cshb4pXbT4Rbzr7IAHG0iUv3gXR44z3b661tiigmn68RyFLb_N4agFqwnJldQsRsK4dc2n9NsBuehsC4y-0ifwM761okYN0-Wd8L3Um_zKEk58uOysiQsQwwQdwnuOdF100esyYjhNnwsYn7Vy64ib7-5Ifhd7TD2-tMG7yjxOMNmC4fkf1artiNIhF0q4Qk7PZ61Z4n2X';

type Period = '30j' | 'trimestre' | 'annee';

const TYPE_COLORS: Record<string, string> = {
  pdf: '#13ec5b',
  image: '#3b82f6',
  photo: '#3b82f6',
  carte: '#64748b',
  video: '#f59e0b',
  audio: '#a855f7',
};

function typeColorHex(type: string): string {
  return TYPE_COLORS[(type || '').toLowerCase()] ?? '#94a3b8';
}

function typeIcon(type: string) {
  const t = (type || '').toLowerCase();
  if (t === 'pdf') return 'picture_as_pdf';
  if (t === 'image' || t === 'photo') return 'image';
  if (t === 'video') return 'video_file';
  if (t === 'audio') return 'audio_file';
  return 'description';
}

function typeColor(type: string) {
  const t = (type || '').toLowerCase();
  if (t === 'pdf') return 'text-admin-primary';
  if (t === 'image' || t === 'photo') return 'text-blue-500';
  if (t === 'video') return 'text-amber-500';
  if (t === 'audio') return 'text-purple-500';
  return 'text-slate-500';
}

function typeBorderColor(type: string) {
  const t = (type || '').toLowerCase();
  if (t === 'pdf') return 'border-admin-primary';
  if (t === 'image' || t === 'photo') return 'border-blue-500';
  if (t === 'video') return 'border-amber-500';
  if (t === 'audio') return 'border-purple-500';
  return 'border-slate-400';
}

export function AdminDashboard() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30j');

  useEffect(() => {
    setLoading(true);
    adminApi
      .stats({ period })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Chargement des statistiques…</div>
      </div>
    );
  }

  const { stats, traffic_by_month, type_distribution, most_viewed: mostViewed } = data;
  const totalViews = stats.views_total ?? 0;
  const docsCount = stats.documents_count ?? 0;
  const usersCount = stats.users_count ?? 0;
  const newDocs = stats.new_documents_in_period ?? docsCount;
  const newDocsChange = stats.new_documents_change_percent;

  const trafficData = traffic_by_month?.data ?? [];
  const maxTraffic = Math.max(1, ...trafficData);
  const n = trafficData.length;
  const trafficPath =
    n > 0 &&
    (() => {
      const w = 100;
      const h = 35;
      const points = trafficData.map((v, i) => {
        const x = n > 1 ? (i / (n - 1)) * w : w / 2;
        const y = h - (v / maxTraffic) * h;
        return `${x},${y}`;
      });
      return `M ${points.join(' L ')}`;
    })();
  const trafficAreaPath = trafficPath ? `${trafficPath} V 40 H 0 Z` : '';

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analytiques des Consultations V1</h2>
          <p className="text-sm text-slate-500">Vue d&apos;ensemble statistique du trafic documentaire.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPeriod('30j')}
              className={`px-3 py-1.5 text-xs font-bold rounded shadow-sm transition-colors ${period === '30j' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              30 derniers jours
            </button>
            <button
              type="button"
              onClick={() => setPeriod('trimestre')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${period === 'trimestre' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Trimestre
            </button>
            <button
              type="button"
              onClick={() => setPeriod('annee')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${period === 'annee' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Année
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 bg-admin-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm shadow-admin-primary/20 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Exporter Rapport
          </button>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* KPI Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-admin-primary/10 rounded-lg text-admin-primary">
                <span className="material-symbols-outlined">visibility</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Consultations</p>
            <p className="text-2xl font-bold mt-1">{totalViews.toLocaleString('fr-FR')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Utilisateurs</p>
            <p className="text-2xl font-bold mt-1">{usersCount.toLocaleString('fr-FR')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <span className="material-symbols-outlined">description</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Documents</p>
            <p className="text-2xl font-bold mt-1">{docsCount.toLocaleString('fr-FR')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <span className="material-symbols-outlined">file_present</span>
              </div>
              {newDocsChange != null && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${newDocsChange >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}
                >
                  {newDocsChange >= 0 ? '+' : ''}{newDocsChange}%
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500">Nouveaux (période)</p>
            <p className="text-2xl font-bold mt-1">{newDocs.toLocaleString('fr-FR')}</p>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traffic Trends */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Nouveaux documents par mois</h3>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-admin-primary" /> 12 derniers mois
              </span>
            </div>
            <div className="relative h-64 w-full">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                {trafficAreaPath && (
                  <path d={trafficAreaPath} fill="url(#adminGrad1)" opacity="0.2" />
                )}
                {trafficPath && (
                  <path d={trafficPath} fill="none" stroke="#13ec5b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" />
                )}
                <defs>
                  <linearGradient id="adminGrad1" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#13ec5b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#13ec5b" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between mt-4 px-2">
                {(traffic_by_month?.labels ?? []).map((m) => (
                  <span key={m} className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[12%]">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Type de Document */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6">Type de Document</h3>
            <div className="relative flex-1 flex items-center justify-center min-h-[180px]">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" fill="none" r="70" stroke="#f1f5f9" strokeWidth="20" />
                {(type_distribution ?? []).length > 0 ? (
                  (() => {
                    const circumference = 2 * Math.PI * 70;
                    let offset = 0;
                    return type_distribution.map((item) => {
                      const dash = (item.percentage / 100) * circumference;
                      const segment = (
                        <circle
                          key={item.type}
                          cx="96"
                          cy="96"
                          fill="none"
                          r="70"
                          stroke={typeColorHex(item.type)}
                          strokeDasharray={`${dash} ${circumference}`}
                          strokeDashoffset={-offset}
                          strokeWidth="20"
                        />
                      );
                      offset += dash;
                      return segment;
                    });
                  })()
                ) : (
                  <circle cx="96" cy="96" fill="none" r="70" stroke="#e2e8f0" strokeWidth="20" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-black">{docsCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {(type_distribution ?? []).map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: typeColorHex(item.type) }}
                  />
                  <span className="text-xs font-semibold truncate">
                    {item.type} ({item.percentage}%)
                  </span>
                </div>
              ))}
              {(!type_distribution || type_distribution.length === 0) && (
                <p className="text-xs text-slate-400 col-span-2">Aucun document</p>
              )}
            </div>
          </div>
        </div>

        {/* Region & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Popularité par Région (Maroc)</h3>
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span> TEMPS RÉEL
              </div>
            </div>
            <div className="rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <div className="relative h-56 sm:h-64 flex items-center justify-center">
                <div className="absolute inset-0 morocco-map-overlay opacity-30 pointer-events-none" />
                <div
                  className="relative z-[1] w-full h-full bg-center bg-no-repeat bg-contain"
                  style={{ backgroundImage: `url(${MOROCCO_MAP_URL})` }}
                  title="Carte Maroc"
                />
                <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-admin-primary/30 rounded-full animate-ping pointer-events-none" />
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-admin-primary rounded-full shadow border-2 border-white pointer-events-none" />
                <div className="absolute top-[45%] left-1/4 w-4 h-4 bg-admin-primary/30 rounded-full pointer-events-none" />
                <div className="absolute top-[45%] left-1/4 w-2.5 h-2.5 bg-admin-primary rounded-full shadow border-2 border-white pointer-events-none" />
              </div>
              <div className="px-4 py-3 bg-white border-t border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Top 3 Régions</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-slate-700">Casablanca-Settat</span>
                    <span className="text-admin-primary font-bold">42%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-700">Rabat-Salé-Kénitra</span>
                    <span className="text-admin-primary font-bold">28%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-700">Marrakech-Safi</span>
                    <span className="text-admin-primary font-bold">15%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6">Consultations Récentes</h3>
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
              {mostViewed.slice(0, 4).map((doc, i) => {
                const places = ['Casablanca', 'Marrakech', 'Fès', 'Rabat'];
                const mins = [2, 14, 25, 60];
                return (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className={`flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-4 ${typeBorderColor(doc.type)}`}
                  >
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${doc.type === 'pdf' ? 'bg-admin-primary/10 text-admin-primary' : doc.type === 'image' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                      <span className="material-symbols-outlined">{typeIcon(doc.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">Consulté depuis {places[i % places.length]} • Il y a {mins[i]} min</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">#{doc.id}</span>
                  </Link>
                );
              })}
              {mostViewed.length === 0 && (
                <p className="text-sm text-slate-500 py-4">Aucune consultation récente.</p>
              )}
            </div>
            <Link to="/admin/documents" className="mt-6 pt-4 text-sm font-bold text-admin-primary hover:underline text-center block">
              Voir tout l&apos;historique
            </Link>
          </div>
        </div>

        {/* Table Documents les plus consultés */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold">Documents les plus consultés</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un document..."
                className="pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-admin-primary/50 w-64 outline-none"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vues</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temps Moyen</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taux de Rebond</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mostViewed.slice(0, 4).map((doc, i) => {
                  const bounce = [12, 45, 18, 62][i % 4];
                  const avgTime = ['06:45', '03:12', '08:20', '05:40'][i % 4];
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-xl ${typeColor(doc.type)}`}>description</span>
                          <Link to={`/documents/${doc.id}`} className="text-sm font-semibold hover:text-admin-primary">
                            {doc.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase">{doc.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{doc.views_count.toLocaleString('fr-FR')}</td>
                      <td className="px-6 py-4 text-sm">{avgTime}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${Math.min(bounce, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold">{bounce}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/admin/documents/${doc.id}/edit`} className="text-slate-400 hover:text-admin-primary inline-flex">
                          <span className="material-symbols-outlined text-xl">more_vert</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Affichage de 1-{Math.min(4, mostViewed.length)} sur {docsCount} documents
            </p>
            <div className="flex gap-2">
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded border border-admin-primary bg-admin-primary text-white text-xs font-bold">
                1
              </button>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50">
                2
              </button>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:bg-slate-50">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
