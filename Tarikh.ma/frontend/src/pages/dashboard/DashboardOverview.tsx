import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, type ArticleItem } from '@/api/client';

export function DashboardOverview() {
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        articlesApi.myArticles({ per_page: 5 })
            .then((res) => setArticles(res.data))
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, []);

    const stats = {
        draft: articles.filter((a) => a.status === 'draft').length,
        pending: articles.filter((a) => a.status === 'pending_review').length,
        approved: articles.filter((a) => a.status === 'approved').length,
        rejected: articles.filter((a) => a.status === 'rejected').length,
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
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Tableau de bord</h2>
                <p className="text-slate-500">Gérez vos articles et suivez leur statut de publication.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500">edit_note</span>
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stats.draft}</p>
                    <p className="text-sm text-slate-500">Brouillons</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-600">hourglass_top</span>
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stats.pending}</p>
                    <p className="text-sm text-slate-500">En attente</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stats.approved}</p>
                    <p className="text-sm text-slate-500">Publiés</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600">cancel</span>
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stats.rejected}</p>
                    <p className="text-sm text-slate-500">Rejetés</p>
                </div>
            </div>

            {/* Quick Action */}
            <div className="bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 rounded-2xl p-8 border border-accent-gold/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Partagez votre savoir</h3>
                        <p className="text-slate-600">Rédigez un article et contribuez à la préservation de notre histoire.</p>
                    </div>
                    <Link
                        to="/dashboard/articles/new"
                        className="bg-accent-gold text-white px-6 py-3 rounded-xl font-bold hover:bg-accent-gold/90 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nouvel article
                    </Link>
                </div>
            </div>

            {/* Recent Articles */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Mes derniers articles</h3>
                    <Link to="/dashboard/articles" className="text-sm text-accent-gold font-medium hover:underline">
                        Voir tout
                    </Link>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : articles.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p>Vous n'avez pas encore d'articles.</p>
                        <Link to="/dashboard/articles/new" className="text-accent-gold font-medium hover:underline mt-2 inline-block">
                            Créer votre premier article
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {articles.slice(0, 5).map((article) => (
                            <div key={article.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-900 truncate">{article.title}</h4>
                                    <p className="text-sm text-slate-500">{new Date(article.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[article.status]}`}>
                                        {statusLabels[article.status]}
                                    </span>
                                    <Link
                                        to={`/dashboard/articles/${article.id}/edit`}
                                        className="text-slate-400 hover:text-accent-gold transition-colors"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
