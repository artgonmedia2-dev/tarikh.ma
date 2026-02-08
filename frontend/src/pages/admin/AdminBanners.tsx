import { useEffect, useState } from 'react';
import { adminApi, type BannerItem } from '@/api/client';

export function AdminBanners() {
    const [banners, setBanners] = useState<BannerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState(0);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const data = await adminApi.banners.list();
            setBanners(data);
        } catch (err) {
            console.error('Erreur bannières:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        if (image) formData.append('image', image);
        if (linkUrl) formData.append('link_url', linkUrl);
        formData.append('is_active', isActive ? '1' : '0');
        formData.append('order', String(order));

        try {
            await adminApi.banners.create(formData);
            setShowModal(false);
            resetForm();
            fetchBanners();
        } catch (err: any) {
            alert(err.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (banner: BannerItem) => {
        const formData = new FormData();
        formData.append('is_active', banner.is_active ? '0' : '1');
        try {
            await adminApi.banners.update(banner.id, formData);
            fetchBanners();
        } catch (err) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer cette bannière ?')) return;
        try {
            await adminApi.banners.delete(id);
            fetchBanners();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setTitle('');
        setLinkUrl('');
        setImage(null);
        setIsActive(true);
        setOrder(0);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestion des Bannières</h1>
                    <p className="text-slate-500">Gérez les publicités affichées sur la page d'accueil</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nouvelle Bannière
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-32 bg-slate-100 relative">
                                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleToggleActive(banner)}
                                        className={`p-1.5 rounded-full backdrop-blur-md ${banner.is_active ? 'bg-green-500/80 text-white' : 'bg-slate-500/80 text-white'}`}
                                        title={banner.is_active ? 'Désactiver' : 'Activer'}
                                    >
                                        <span className="material-symbols-outlined text-sm">{banner.is_active ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-1.5 bg-red-500/80 text-white rounded-full backdrop-blur-md"
                                        title="Supprimer"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 truncate">{banner.title}</h3>
                                <p className="text-xs text-slate-500 truncate mb-3">{banner.link_url || 'Aucun lien'}</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Ordre: {banner.order}</span>
                                    <span className={banner.is_active ? 'text-green-600 font-bold' : 'text-slate-400'}>
                                        {banner.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {banners.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">ads_click</span>
                            <p className="text-slate-500">Aucune bannière configurée</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Ajouter une bannière</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Ex: Exposition 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image (Recommandé: 1200x300)</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lien de redirection (URL)</label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ordre</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer py-2">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Activer</span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Envoi...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
