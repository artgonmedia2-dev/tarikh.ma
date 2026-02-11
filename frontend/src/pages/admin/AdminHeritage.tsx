import { useEffect, useState } from 'react';
import { adminApi, type HeritageSectionItem } from '@/api/client';

export function AdminHeritage() {
    const [sections, setSections] = useState<HeritageSectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingSection, setEditingSection] = useState<HeritageSectionItem | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState(0);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const data = await adminApi.heritageSections.list();
            setSections(data);
        } catch (err) {
            console.error('Erreur sections héritage:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('icon', icon);
        if (image) formData.append('image', image);
        if (linkUrl) formData.append('link_url', linkUrl);
        formData.append('is_active', isActive ? '1' : '0');
        formData.append('order', String(order));

        try {
            if (editingSection) {
                await adminApi.heritageSections.update(editingSection.id, formData);
            } else {
                await adminApi.heritageSections.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchSections();
        } catch (err: any) {
            alert(err.message || 'Erreur lors de l’enregistrement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (section: HeritageSectionItem) => {
        setEditingSection(section);
        setTitle(section.title);
        setDescription(section.description);
        setIcon(section.icon);
        setLinkUrl(section.link_url || '');
        setIsActive(section.is_active);
        setOrder(section.order);
        setShowModal(true);
    };

    const handleToggleActive = async (section: HeritageSectionItem) => {
        const formData = new FormData();
        formData.append('is_active', section.is_active ? '0' : '1');
        try {
            await adminApi.heritageSections.update(section.id, formData);
            fetchSections();
        } catch (err) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer cette section ?')) return;
        try {
            await adminApi.heritageSections.delete(id);
            fetchSections();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setEditingSection(null);
        setTitle('');
        setDescription('');
        setIcon('');
        setLinkUrl('');
        setImage(null);
        setIsActive(true);
        setOrder(0);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Section "Explorer l'Héritage"</h1>
                    <p className="text-slate-500">Gérez les cartes de navigation de la page d'accueil</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nouvelle Section
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
                    {sections.map((section) => (
                        <div key={section.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-32 bg-slate-100 relative">
                                <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(section)}
                                        className="p-1.5 bg-white/90 text-slate-700 rounded-full backdrop-blur-md shadow-sm"
                                        title="Modifier"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(section)}
                                        className={`p-1.5 rounded-full backdrop-blur-md ${section.is_active ? 'bg-green-500/80 text-white' : 'bg-slate-500/80 text-white'}`}
                                        title={section.is_active ? 'Désactiver' : 'Activer'}
                                    >
                                        <span className="material-symbols-outlined text-sm">{section.is_active ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(section.id)}
                                        className="p-1.5 bg-red-500/80 text-white rounded-full backdrop-blur-md"
                                        title="Supprimer"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-accent-gold text-lg">{section.icon}</span>
                                    <h3 className="font-bold text-slate-800 truncate">{section.title}</h3>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{section.description}</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Ordre: {section.order}</span>
                                    <span className={section.is_active ? 'text-green-600 font-bold' : 'text-slate-400'}>
                                        {section.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingSection ? 'Modifier la section' : 'Ajouter une section'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                        placeholder="Ex: Livres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Icône (Material Symbol)</label>
                                    <input
                                        type="text"
                                        required
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                        placeholder="Ex: library_books"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none h-20"
                                    placeholder="Courte description de la catégorie..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image {editingSection && '(Optionnel si inchangé)'}</label>
                                <input
                                    type="file"
                                    required={!editingSection}
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lien de redirection</label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                    placeholder="/archives?type=..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ordre</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
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
