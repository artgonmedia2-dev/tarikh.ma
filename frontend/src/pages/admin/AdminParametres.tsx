import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AdminParametres() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 bg-white">
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link to="/admin" className="hover:text-slate-700">Accueil</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Administration</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-admin-primary font-semibold">Paramètres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Paramètres
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configuration générale de la plateforme et options d&apos;administration.
          </p>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Section Général */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">tune</span>
                Général
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la plateforme</label>
                <input
                  type="text"
                  defaultValue="Tarikh.ma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email de contact</label>
                <input
                  type="email"
                  placeholder="contact@tarikh.ma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary"
                />
              </div>
              <button
                type="button"
                className="px-4 py-2.5 bg-admin-primary text-white font-bold rounded-lg hover:brightness-110 transition-all text-sm"
              >
                Enregistrer
              </button>
            </div>
          </section>

          {/* Section Sécurité */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">lock</span>
                Sécurité
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Authentification à deux facteurs</p>
                  <p className="text-xs text-slate-500">Recommandé pour les comptes administrateur.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={false}
                  className="relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 border-slate-200 bg-slate-200 transition-colors"
                >
                  <span className="inline-block h-4 w-4 rounded-full bg-white shadow translate-x-0.5" style={{ marginTop: 2 }} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Expiration des sessions</p>
                  <p className="text-xs text-slate-500">Déconnexion automatique après inactivité.</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-admin-primary/50">
                  <option value="60">1 heure</option>
                  <option value="480">8 heures</option>
                  <option value="1440">24 heures</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section Notifications */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">notifications</span>
                Notifications
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Alertes par email</p>
                  <p className="text-xs text-slate-500">Nouveaux documents, signalements, etc.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={true}
                  className="relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 bg-admin-primary border-admin-primary transition-colors"
                >
                  <span className="inline-block h-4 w-4 rounded-full bg-white shadow translate-x-5" style={{ marginTop: 2 }} />
                </button>
              </div>
            </div>
          </section>

          {/* Section Support */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">help</span>
                Support & Admin
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Pour toute question technique ou demande d&apos;accès, contactez l&apos;équipe Tarikh.ma.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:admin@tarikh.ma"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Contacter l&apos;admin
                </a>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-admin-primary/10 text-admin-primary rounded-lg hover:bg-admin-primary/20 transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  Retour au tableau de bord
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
