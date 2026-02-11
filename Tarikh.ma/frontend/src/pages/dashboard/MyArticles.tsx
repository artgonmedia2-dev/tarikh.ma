import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, type ArticleItem } from '@/api/client';

export function MyArticles() {
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        setLoading(true);
        articlesApi.myArticles({ page, per_page: 10, status: statusFilter || undefined })
            .then((res) => {
                setArticles(res.data);
                setLastPage(res.last_page);
            })
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, [page, statusFilter]);

    const handleDelete = async (id: number, title: string) => {
        if (!window.confirm(`Supprimer « ${title} » ?`)) return;
        try {
            await articlesApi.delete(id);
            setArticles((prev) => prev.filter((a) => a.id !== id));
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Erreur lors de la suppression');
        }
    };

    const handleSubmit = async (id: number) => {
        if (!window.confirm('Soumettre cet article pour validation ?')) return;
        try {
            const res = await articlesApi.submit(id);
            setArticles((prev) => prev.map((a) => (a.id === id ? res.article : a)));
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Erreur lors de la soumission');
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Mes articles</h2>
                    <p className="text-slate-500 text-sm">Gérez et suivez vos contributions.</p>
                </div>
                <Link
                    to="/dashboard/articles/new"
                    className="bg-accent-gold text-white px-5 py-2.5 rounded-xl font-bold hover:bg-accent-gold/90 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Nouvel article
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['', 'draft', 'pending_review', 'approved', 'rejected'].map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => { setStatusFilter(status); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-accent-gold text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {status === '' ? 'Tous' : statusLabels[status as keyof typeof statusLabels]}
                    </button>
                ))}
            </div>

            {/* Articles List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : articles.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p>Aucun article trouvé.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {articles.map((article) => (
                            <div key={article.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-slate-900 truncate">{article.title}</h4>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[article.status]}`}>
                                            {statusLabels[article.status]}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-2">
                                        {article.category?.name || 'Sans catégorie'} • {new Date(article.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                    {article.status === 'rejected' && article.admin_comment && (
                                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
                                            <strong>Motif du rejet :</strong> {article.admin_comment}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {article.status === 'draft' && (
                                        <button
                                            type="button"
                                            onClick={() => handleSubmit(article.id)}
                                            className="px-3 py-1.5 bg-accent-gold/10 text-accent-gold rounded-lg text-sm font-medium hover:bg-accent-gold/20 transition-colors"
                                        >
                                            Soumettre
                                        </button>
                                    )}
                                    {(article.status === 'draft' || article.status === 'rejected') && (
                                        <Link
                                            to={`/dashboard/articles/${article.id}/edit`}
                                            className="p-2 text-slate-400 hover:text-accent-gold transition-colors"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </Link>
                                    )}
                                    {article.status === 'draft' && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(article.id, article.title)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    )}
                                    {article.status === 'approved' && (
                                        <Link
                                            to={`/articles/${article.slug}`}
                                            className="p-2 text-slate-400 hover:text-accent-gold transition-colors"
                                            title="Voir l'article publié"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <span className="px-4 py-2 text-slate-600">
                        Page {page} / {lastPage}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                        disabled={page >= lastPage}
                        className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
