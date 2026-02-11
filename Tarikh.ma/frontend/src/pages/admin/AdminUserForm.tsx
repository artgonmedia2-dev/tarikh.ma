import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { adminApi } from '@/api/client';

const ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'editor', label: 'Éditeur' },
  { value: 'reader', label: 'Lecteur' },
];

export function AdminUserForm() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'new';

  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('reader');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    adminApi.users
      .get(Number(id))
      .then((u) => {
        setName(u.name);
        setEmail(u.email);
        setRole(u.role);
      })
      .catch(() => setError('Utilisateur introuvable'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    if (!isEdit && password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setSaving(false);
      return;
    }
    if (!isEdit && password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setSaving(false);
      return;
    }

    const promise = isEdit
      ? adminApi.users.update(Number(id), {
          name,
          email,
          role,
          ...(password ? { password, password_confirmation: passwordConfirmation } : {}),
        })
      : adminApi.users.create({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role,
        });

    promise
      .then(() => navigate('/admin/users'))
      .catch((err: Error) => {
        setError(err.message);
        setSaving(false);
      });
  };

  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Accès réservé aux administrateurs.</p>
        <Link to="/" className="text-primary font-semibold mt-4 inline-block">Accueil</Link>
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

  if (loading && isEdit) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/admin/users" className="text-primary font-medium hover:underline mb-6 inline-block">
        ← Retour aux utilisateurs
      </Link>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
        {isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Nom *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Rôle *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
            Mot de passe {isEdit ? '(laisser vide pour ne pas changer)' : '*'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isEdit ? 0 : 8}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Confirmer le mot de passe *</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
          </button>
          <Link
            to="/admin/users"
            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
