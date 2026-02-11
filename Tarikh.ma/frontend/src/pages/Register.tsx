import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/client';

export function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('reader');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password, passwordConfirmation, role);
      setAuth(res.token, { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role });
      if (res.user.role === 'editor') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/archives', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Inscription</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Créez votre compte Tarikh.ma</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setRole('reader')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'reader' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lecteur
          </button>
          <button
            type="button"
            onClick={() => setRole('editor')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Contributeur
          </button>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Nom *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="vous@exemple.ma"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Confirmer le mot de passe *
          </label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-gold text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-accent-gold/20"
        >
          {loading ? 'Inscription…' : 'S\'inscrire'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-accent-gold font-bold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
