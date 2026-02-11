import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/client';

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setAuth(res.token, { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role });
      navigate('/archives', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Connexion</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Accédez à votre compte Tarikh.ma</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
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
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-gold text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-accent-gold/20"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-accent-gold font-bold hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
