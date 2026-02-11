import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminArticlesApi, type ArticleItem } from '@/api/client';

export function AdminArticles() {
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('pending_review');
    const [stats, setStats] = useState({ total: 0, draft: 0, pending: 0, approved: 0, rejected: 0 });

    useEffect(() => {
        adminArticlesApi.stats().then(setStats).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        adminArticlesApi.list({ page, per_page: 10, status: statusFilter || undefined })
            .then((res) => {
                setArticles(res.data);
                setLastPage(res.last_page);
            })
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, [page, statusFilter]);

    const handleApprove = async (id: number) => {
        if (!window.confirm('Approuver et publier cet article ?')) return;
        try {
            const res = await adminArticlesApi.approve(id);
            setArticles((prev) => prev.map((a) => (a.id === id ? res.article : a)));
            setStats((prev) => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Erreur');
        }
    };

    const handleReject = async (id: number) => {
        const comment = window.prompt('Motif du rejet :');
        if (!comment) return;
        try {
            const res = await adminArticlesApi.reject(id, comment);
            setArticles((prev) => prev.map((a) => (a.id === id ? res.article : a)));
            setStats((prev) => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Erreur');
        }
    };

    const statusColors = {
        draft: 'bg-slate-100 text-slate-600',
        pending_review: 'bg-amber-100 text-amber-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const statusLabels = {
        draft: 'Brouillon',
        pending_review: 'En attente',
        approved: 'Publié',
        rejected: 'Rejeté',
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Articles</h1>
                    <p className="text-slate-500 mt-1">Modérez les articles soumis par les contributeurs.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
                    <p className="text-sm text-amber-600">En attente</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.approved}</p>
                    <p className="text-sm text-green-600">Publiés</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.rejected}</p>
                    <p className="text-sm text-red-600">Rejetés</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-slate-500">Total</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['', 'pending_review', 'approved', 'rejected', 'draft'].map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => { setStatusFilter(status); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        {status === '' ? 'Tous' : statusLabels[status as keyof typeof statusLabels]}
                    </button>
                ))}
            </div>

            {/* Articles Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : articles.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Aucun article trouvé.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Titre</th>
                                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Auteur</th>
                                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Catégorie</th>
                                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Statut</th>
                                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Date</th>
                                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((article) => (
                                    <tr key={article.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-4">
                                            <Link to={`/admin/articles/${article.id}/review`} className="font-medium text-primary hover:underline">
                                                {article.title}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {article.user?.name || 'Inconnu'}
                                        </td>
                                        <td className="p-4 text-sm">{article.category?.name || '—'}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[article.status]}`}>
                                                {statusLabels[article.status]}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(article.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/articles/${article.id}/review`}
                                                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    Voir
                                                </Link>
                                                {article.status === 'pending_review' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(article.id)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                        >
                                                            Approuver
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(article.id)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            Rejeter
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
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
                        Page {page} / {lastPage}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                        disabled={page >= lastPage}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
