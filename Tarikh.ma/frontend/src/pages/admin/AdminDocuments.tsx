import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { adminApi, type DocumentItem } from '@/api/client';

export function AdminDocuments() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<{ data: DocumentItem[]; current_page: number; last_page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'editor') return;
    setLoading(true);
    adminApi.documents
      .list({ page, per_page: 20 })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user?.role, page]);

  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`Supprimer « ${title} » ?`)) return;
    adminApi.documents
      .delete(id)
      .then(() => setData((prev) => prev ? { ...prev, data: prev.data.filter((d) => d.id !== id) } : null))
      .catch((e) => alert(e.message));
  };

  if (user && user.role !== 'admin' && user.role !== 'editor') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Accès réservé aux administrateurs et éditeurs.</p>
        <Link to="/" className="text-primary font-semibold mt-4 inline-block">Retour à l&apos;accueil</Link>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Veuillez vous connecter.</p>
        <Link to="/login" className="text-primary font-semibold mt-4 inline-block">Connexion</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Documents</h1>
        <Link
          to="/admin/documents/new"
          className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity"
        >
          Ajouter un document
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement…</div>
        ) : data && data.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Titre</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Type</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Année</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Statut</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Vues</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-4">
                      <Link to={`/documents/${doc.id}`} className="font-medium text-primary hover:underline">
                        {doc.title}
                      </Link>
                    </td>
                    <td className="p-4 text-sm">{doc.type}</td>
                    <td className="p-4 text-sm">{doc.year ?? '—'}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${(doc as DocumentItem & { status?: string }).status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : (doc as DocumentItem & { status?: string }).status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                        {(doc as DocumentItem & { status?: string }).status === 'approved' ? 'Approuvé' : (doc as DocumentItem & { status?: string }).status === 'rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{doc.views_count}</td>
                    <td className="p-4 flex gap-2">
                      <Link
                        to={`/admin/documents/${doc.id}/edit`}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-slate-500">Aucun document.</p>
        )}
      </div>
      {data && data.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
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
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
