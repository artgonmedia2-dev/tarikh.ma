import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi, type ArticleItem, type ArticleCategory } from '@/api/client';

export function ArticleEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<ArticleCategory[]>([]);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [tags, setTags] = useState('');
    const [sources, setSources] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [existingArticle, setExistingArticle] = useState<ArticleItem | null>(null);

    useEffect(() => {
        articlesApi.categories().then(setCategories).catch(() => { });
    }, []);

    useEffect(() => {
        if (isEditing && id) {
            setLoading(true);
            articlesApi.show(parseInt(id, 10))
                .then((article) => {
                    setExistingArticle(article);
                    setTitle(article.title);
                    setContent(article.content);
                    setCategoryId(article.category_id || '');
                    setTags(article.tags?.join(', ') || '');
                    setSources(article.sources || '');
                    setCoverPreview(article.cover_image_url);
                })
                .catch(() => navigate('/dashboard/articles'))
                .finally(() => setLoading(false));
        }
    }, [id, isEditing, navigate]);

    const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    }, []);

    const handleSave = async (submitAfter = false) => {
        if (!title.trim() || !content.trim()) {
            alert('Le titre et le contenu sont requis.');
            return;
        }

        setSaving(true);
        try {
            const form = new FormData();
            form.append('title', title);
            form.append('content', content);
            if (categoryId) form.append('category_id', String(categoryId));
            if (tags.trim()) {
                tags.split(',').map((t) => t.trim()).filter(Boolean).forEach((t, i) => {
                    form.append(`tags[${i}]`, t);
                });
            }
            if (sources) form.append('sources', sources);
            if (coverFile) form.append('cover', coverFile);

            let article: ArticleItem;
            if (isEditing && id) {
                article = await articlesApi.update(parseInt(id, 10), form);
            } else {
                article = await articlesApi.create(form);
            }

            if (submitAfter) {
                await articlesApi.submit(article.id);
                alert('Article soumis pour validation !');
            } else {
                alert(isEditing ? 'Article mis à jour !' : 'Brouillon enregistré !');
            }

            navigate('/dashboard/articles');
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12 text-slate-500">Chargement...</div>
        );
    }

    const canEdit = !isEditing || existingArticle?.status === 'draft' || existingArticle?.status === 'rejected';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">
                        {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {isEditing ? 'Modifiez et mettez à jour votre article.' : 'Rédigez un nouvel article historique.'}
                    </p>
                </div>
            </div>

            {existingArticle?.status === 'rejected' && existingArticle.admin_comment && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-bold text-red-700 mb-1">Motif du rejet</p>
                    <p className="text-red-600">{existingArticle.admin_comment}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                        Titre *
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Ex: Les dynasties marocaines au Moyen Âge"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none disabled:bg-slate-100"
                    />
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-2">
                        Catégorie
                    </label>
                    <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value, 10) : '')}
                        disabled={!canEdit}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none disabled:bg-slate-100"
                    >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                <div>
                    <label htmlFor="content" className="block text-sm font-bold text-slate-700 mb-2">
                        Contenu *
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={!canEdit}
                        rows={15}
                        placeholder="Rédigez votre article ici. Vous pouvez utiliser le format Markdown pour la mise en forme."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none disabled:bg-slate-100 font-mono text-sm"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        Astuce : utilisez **gras**, *italique*, # titre, - liste pour formater votre texte.
                    </p>
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Image de couverture
                    </label>
                    <div className="flex items-start gap-4">
                        {coverPreview && (
                            <img
                                src={coverPreview}
                                alt="Aperçu"
                                className="w-32 h-20 object-cover rounded-lg border border-slate-200"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            disabled={!canEdit}
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-gold/10 file:text-accent-gold file:font-medium hover:file:bg-accent-gold/20 file:cursor-pointer"
                        />
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label htmlFor="tags" className="block text-sm font-bold text-slate-700 mb-2">
                        Mots-clés
                    </label>
                    <input
                        id="tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Ex: Marrakech, Almohades, Architecture (séparés par des virgules)"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none disabled:bg-slate-100"
                    />
                </div>

                {/* Sources */}
                <div>
                    <label htmlFor="sources" className="block text-sm font-bold text-slate-700 mb-2">
                        Références / Sources
                    </label>
                    <textarea
                        id="sources"
                        value={sources}
                        onChange={(e) => setSources(e.target.value)}
                        disabled={!canEdit}
                        rows={3}
                        placeholder="Listez vos sources et références bibliographiques..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none disabled:bg-slate-100"
                    />
                </div>
            </div>

            {/* Actions */}
            {canEdit && (
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/articles')}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl border border-accent-gold/30 bg-accent-gold/10 text-accent-gold font-bold hover:bg-accent-gold/20 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-accent-gold text-white font-bold hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Envoi...' : 'Soumettre pour validation'}
                    </button>
                </div>
            )}
        </div>
    );
}
