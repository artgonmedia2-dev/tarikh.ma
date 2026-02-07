import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { adminApi, themesApi, regionsApi } from '@/api/client';

const TYPES = ['pdf', 'image', 'carte', 'video', 'audio'] as const;
const ACCEPT = '.pdf,.jpg,.jpeg,.png';
const MAX_MB = 50;

export function AdminDocumentForm() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'new';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [themes, setThemes] = useState<{ id: number; name: string }[]>([]);
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [watermark, setWatermark] = useState(true);
  const [accessLevel, setAccessLevel] = useState<'public' | 'restricted' | 'private'>('public');
  const [dragOver, setDragOver] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('pdf');
  const [year, setYear] = useState('');
  const [regionId, setRegionId] = useState<number | ''>('');
  const [themeId, setThemeId] = useState<number | ''>('');
  const [language, setLanguage] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [document, setDocument] = useState<{ pages_status?: string; pages_count?: number | null; thumbnail_url?: string | null } | null>(null);
  const [conversionProgress, setConversionProgress] = useState<{ current: number; total: number } | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    themesApi.list().then((t) => setThemes(t)).catch(() => []);
    regionsApi.list().then((r) => setRegions(r)).catch(() => []);
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    setError('');
    adminApi.documents
      .get(Number(id))
      .then((doc) => {
        setTitle(doc.title);
        setAuthor(doc.author ?? '');
        setDescription(doc.description ?? '');
        setType(doc.type);
        setYear(doc.year ?? '');
        setRegionId(doc.region_id ?? '');
        setThemeId(doc.theme_id ?? '');
        setLanguage(doc.language ?? '');
        setKeywords(doc.keywords ?? '');
        setDocument({
          pages_status: doc.pages_status ?? undefined,
          pages_count: doc.pages_count ?? null,
          thumbnail_url: (doc as any).thumbnail_url ?? null
        });
        if (doc.pages_status === 'processing') {
          adminApi.documents.conversionProgress(Number(id)).then((r) => setConversionProgress(r.progress ?? null)).catch(() => { });
        }
      })
      .catch((err: Error) => {
        const msg = err?.message?.toLowerCase?.();
        if (msg === 'failed to fetch' || msg?.includes('network') || msg?.includes('load'))
          setError('Impossible de joindre le serveur. Vérifiez que l\'API Laravel est démarrée (php artisan serve) et que le proxy pointe vers http://localhost:8000.');
        else
          setError(err?.message ?? 'Document introuvable');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // Poll conversion progress when PDF pages are processing
  useEffect(() => {
    if (!isEdit || !id || type !== 'pdf' || document?.pages_status !== 'processing') return;
    const t = setInterval(() => {
      adminApi.documents.conversionProgress(Number(id)).then((res) => {
        setConversionProgress(res.progress ?? null);
        if (res.pages_status !== 'processing') {
          setDocument((d) => (d ? { ...d, pages_status: res.pages_status, pages_count: res.pages_count } : null));
        }
      }).catch(() => { });
    }, 2000);
    return () => clearInterval(t);
  }, [id, isEdit, type, document?.pages_status]);

  const handleRegeneratePages = () => {
    if (!id || type !== 'pdf') return;
    setRegenerating(true);
    adminApi.documents.regeneratePages(Number(id))
      .then((res) => {
        setDocument({ pages_status: res.document.pages_status ?? 'pending', pages_count: res.document.pages_count ?? null });
        setConversionProgress(null);
      })
      .finally(() => setRegenerating(false));
  };

  const handleFile = (f: File | null) => {
    if (!f) return setFile(null);
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_MB} MB).`);
      return;
    }
    setError('');
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isEdit && !file) {
      setError('Le fichier est obligatoire pour un nouveau document.');
      return;
    }
    setSaving(true);
    const form = new FormData();
    form.append('title', title);
    form.append('author', author);
    form.append('description', description);
    form.append('type', type);
    form.append('year', year);
    form.append('region_id', regionId === '' ? '' : String(regionId));
    form.append('theme_id', themeId === '' ? '' : String(themeId));
    form.append('language', language);
    form.append('keywords', keywords);
    if (file) form.append('file', file);
    if (thumbnail) form.append('thumbnail', thumbnail);
    if (isEdit) form.append('_method', 'PUT');

    const promise = isEdit
      ? adminApi.documents.update(Number(id), form)
      : adminApi.documents.create(form);

    promise
      .then(() => navigate('/admin/documents'))
      .catch((err: Error) => {
        setError(err.message);
        setSaving(false);
      });
  };

  if (user && user.role !== 'admin' && user.role !== 'editor') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Accès réservé.</p>
        <Link to="/" className="text-admin-primary font-semibold mt-4 inline-block">Accueil</Link>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Veuillez vous connecter.</p>
        <Link to="/login" className="text-admin-primary font-semibold mt-4 inline-block">Connexion</Link>
      </div>
    );
  }

  if (loading && isEdit) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link to="/admin/documents" className="hover:underline">Documents</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 font-medium">{isEdit ? 'Modifier' : 'Nouveau Document'}</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {isEdit ? 'Modifier le document' : 'Ajouter un Document Historique'}
        </h2>
        <p className="text-slate-500 mt-2">
          {isEdit ? 'Mettez à jour les métadonnées du document.' : 'Intégrez une nouvelle pièce à la base de données de Tarikh.ma.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Stepper */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex-1 py-4 px-6 flex items-center gap-3 ${step === 1 ? 'step-active' : 'text-slate-500 border-b-2 border-transparent'}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step === 1 ? 'bg-admin-primary text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
              <span className="text-sm font-bold">Fichier</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex-1 py-4 px-6 flex items-center gap-3 ${step === 2 ? 'step-active' : 'text-slate-500 border-b-2 border-transparent'}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step === 2 ? 'bg-admin-primary text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
              <span className="text-sm font-semibold">Détails (Métadonnées)</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`flex-1 py-4 px-6 flex items-center gap-3 ${step === 3 ? 'step-active' : 'text-slate-500 border-b-2 border-transparent'}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step === 3 ? 'bg-admin-primary text-white' : 'bg-slate-100 text-slate-500'}`}>3</span>
              <span className="text-sm font-semibold">Sécurité</span>
            </button>
          </div>

          <div className="p-8">
            {/* Étape 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Étape 1 : Téléchargement du fichier</h3>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed px-10 py-16 cursor-pointer transition-colors ${dragOver ? 'border-admin-primary bg-admin-primary/5' : 'border-slate-200 bg-slate-50/50 hover:border-admin-primary/50'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="w-16 h-16 rounded-full bg-admin-primary/10 flex items-center justify-center text-admin-primary">
                    <span className="material-symbols-outlined text-[40px]">upload_file</span>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 text-lg font-bold">Glissez-déposez le document ici</p>
                    <p className="text-slate-500 text-sm mt-1">PDF, JPG, PNG supportés (Max {MAX_MB} MB)</p>
                    {file && <p className="text-admin-primary text-sm font-semibold mt-2">{file.name}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Parcourir les fichiers
                  </button>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">Image miniature (Preview)</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                      {thumbnail ? (
                        <img src={URL.createObjectURL(thumbnail)} alt="Aperçu" className="w-full h-full object-cover" />
                      ) : document?.thumbnail_url ? (
                        <img src={document.thumbnail_url} alt="Aperçu actuel" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-300 text-3xl">image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-3">Téléchargez une image (JPG/PNG) pour l&apos;aperçu dans la liste des archives.</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                        className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-admin-primary/10 file:text-admin-primary hover:file:bg-admin-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="material-symbols-outlined text-blue-600 shrink-0">verified_user</span>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Avis de sécurité</p>
                    <p className="text-sm text-blue-800 mt-1">
                      Tous les fichiers téléchargés sont automatiquement chiffrés. Notre système analyse le document pour s&apos;assurer qu&apos;il respecte les normes de conservation numérique.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Détails du document</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Titre du document <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Ex: Dahir royal de 1912"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Auteur / Source</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Ex: Ibn Khaldoun, Ministère de la Culture"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Description historique</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez le contexte et l'importance de ce document..."
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Type de document <span className="text-red-500">*</span></label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none"
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Année / Période</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="Ex: 1912"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Période / Thématique</label>
                    <select
                      value={themeId}
                      onChange={(e) => setThemeId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none"
                    >
                      <option value="">—</option>
                      {themes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Région du Maroc</label>
                    <select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none"
                    >
                      <option value="">—</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Langue</label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">Mots-clés</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="séparés par des virgules"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Sécurité et accès</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-admin-primary">branding_watermark</span>
                      <div>
                        <p className="text-sm font-bold">Activer le filigrane Tarikh.ma</p>
                        <p className="text-xs text-slate-500">Ajoute un logo semi-transparent sur les images</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watermark}
                        onChange={(e) => setWatermark(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary" />
                    </label>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-900">Niveau d&apos;accès au document</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-colors ${accessLevel === 'public' ? 'border-admin-primary bg-admin-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="access" value="public" checked={accessLevel === 'public'} onChange={() => setAccessLevel('public')} className="sr-only" />
                        <span className={`material-symbols-outlined mb-1 ${accessLevel === 'public' ? 'text-admin-primary' : 'text-slate-500'}`}>public</span>
                        <span className="text-xs font-bold uppercase tracking-wide">Public</span>
                        <span className="text-[10px] text-slate-500 mt-1">Visible par tous</span>
                        {accessLevel === 'public' && (
                          <div className="absolute top-2 right-2">
                            <span className="material-symbols-outlined text-admin-primary text-[18px]">check_circle</span>
                          </div>
                        )}
                      </label>
                      <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-colors ${accessLevel === 'restricted' ? 'border-admin-primary bg-admin-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="access" value="restricted" checked={accessLevel === 'restricted'} onChange={() => setAccessLevel('restricted')} className="sr-only" />
                        <span className={`material-symbols-outlined mb-1 ${accessLevel === 'restricted' ? 'text-admin-primary' : 'text-slate-500'}`}>lock_open</span>
                        <span className="text-xs font-bold uppercase tracking-wide">Inscrit</span>
                        <span className="text-[10px] text-slate-500 mt-1">Utilisateurs connectés</span>
                        {accessLevel === 'restricted' && (
                          <div className="absolute top-2 right-2">
                            <span className="material-symbols-outlined text-admin-primary text-[18px]">check_circle</span>
                          </div>
                        )}
                      </label>
                      <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-colors ${accessLevel === 'private' ? 'border-admin-primary bg-admin-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="access" value="private" checked={accessLevel === 'private'} onChange={() => setAccessLevel('private')} className="sr-only" />
                        <span className={`material-symbols-outlined mb-1 ${accessLevel === 'private' ? 'text-admin-primary' : 'text-slate-500'}`}>lock</span>
                        <span className="text-xs font-bold uppercase tracking-wide">Privé</span>
                        <span className="text-[10px] text-slate-500 mt-1">Admin uniquement</span>
                        {accessLevel === 'private' && (
                          <div className="absolute top-2 right-2">
                            <span className="material-symbols-outlined text-admin-primary text-[18px]">check_circle</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  {isEdit && type === 'pdf' && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <p className="text-sm font-bold text-slate-900">Conversion PDF → pages (flipbook)</p>
                      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-medium text-slate-500 uppercase">Statut</span>
                        <span className={`text-sm font-semibold ${document?.pages_status === 'completed' ? 'text-green-600' : document?.pages_status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
                          {document?.pages_status === 'completed' && `${document?.pages_count ?? 0} page(s)`}
                          {document?.pages_status === 'processing' && 'Conversion en cours…'}
                          {document?.pages_status === 'pending' && 'En attente'}
                          {document?.pages_status === 'failed' && 'Échec'}
                          {!document?.pages_status && '—'}
                        </span>
                        {document?.pages_status === 'processing' && conversionProgress && (
                          <span className="text-xs text-slate-500">{conversionProgress.current} / {conversionProgress.total}</span>
                        )}
                        <button
                          type="button"
                          onClick={handleRegeneratePages}
                          disabled={regenerating || document?.pages_status === 'processing'}
                          className="ml-auto px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">refresh</span>
                          {regenerating ? 'Regénération…' : 'Regénérer les pages'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/admin/documents"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Annuler
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-900 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer en brouillon'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-2.5 bg-admin-primary hover:bg-admin-primary/90 text-white rounded-lg text-sm font-black transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Publier le Document'}
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 text-slate-500 text-xs">
        <p>© {new Date().getFullYear()} Tarikh.ma - Système de Management de Contenu Historique</p>
        <div className="flex gap-4">
          <a href="#support" className="hover:underline">Support technique</a>
          <a href="#logs" className="hover:underline">Logs d&apos;activité</a>
        </div>
      </footer>
    </div>
  );
}
