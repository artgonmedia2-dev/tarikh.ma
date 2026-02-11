import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminArticlesApi, type ArticleItem } from '@/api/client';

export function ArticleReview() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<ArticleItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        adminArticlesApi.show(parseInt(id, 10))
            .then(setArticle)
            .catch(() => navigate('/admin/articles'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleApprove = async () => {
        if (!article || !window.confirm('Approuver et publier cet article ?')) return;
        setActing(true);
        try {
            await adminArticlesApi.approve(article.id);
            alert('Article approuvé et publié !');
            navigate('/admin/articles');
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Erreur');
        } finally {
            setActing(false);
        }
    };

    const handleReject = async () => {
        if (!article) return;
        const comment = window.prompt('Motif du rejet :');
        if (!comment) return;
        setActing(true);
        try {
            await adminArticlesApi.reject(article.id, comment);
            alert('Article rejeté.');
            navigate('/admin/articles');
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Erreur');
        } finally {
            setActing(false);
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
        pending_review: 'En attente de validation',
        approved: 'Publié',
        rejected: 'Rejeté',
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-500">
                Chargement...
            </div>
        );
    }

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-500">
                Article non trouvé.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-6">
                <Link to="/admin/articles" className="text-primary font-medium hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Retour aux articles
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                {article.title}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span>Par <strong>{article.user?.name || 'Inconnu'}</strong></span>
                                <span>•</span>
                                <span>{article.category?.name || 'Sans catégorie'}</span>
                                <span>•</span>
                                <span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${statusColors[article.status]}`}>
                            {statusLabels[article.status]}
                        </span>
                    </div>
                </div>

                {/* Cover Image */}
                {article.cover_image_url && (
                    <div className="border-b border-slate-100 dark:border-slate-800">
                        <img
                            src={article.cover_image_url}
                            alt="Couverture"
                            className="w-full h-64 object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
                        {article.content}
                    </div>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className="px-6 pb-4">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mots-clés</p>
                        <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sources */}
                {article.sources && (
                    <div className="px-6 pb-6">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sources</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{article.sources}</p>
                    </div>
                )}

                {/* Admin Comment (if rejected) */}
                {article.status === 'rejected' && article.admin_comment && (
                    <div className="px-6 pb-6">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <p className="font-bold text-red-700 dark:text-red-400 mb-1">Motif du rejet</p>
                            <p className="text-red-600 dark:text-red-300">{article.admin_comment}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {article.status === 'pending_review' && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={acting}
                            className="px-6 py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                            Rejeter
                        </button>
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={acting}
                            className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            Approuver et Publier
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
