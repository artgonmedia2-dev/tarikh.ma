import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (user.role !== 'admin' && user.role !== 'editor') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null;
  }

  const displayName = user.name?.split(/\s+/).map((s) => s[0]).join('. ') || user.email?.slice(0, 2).toUpperCase() || 'Admin';
  const roleLabel = user.role === 'admin' ? 'Super Admin' : 'Éditeur';

  return (
    <div className="flex h-screen overflow-hidden bg-admin-bg text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-admin-primary rounded-lg p-2 text-white">
            <span className="material-symbols-outlined">history_edu</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Tarikh.ma Admin</h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Portail Analytique</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-admin-primary/10 text-admin-primary' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Tableau de bord</span>
          </NavLink>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-admin-primary/10 text-admin-primary' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>monitoring</span>
            <span className="text-sm font-semibold">Analytiques</span>
          </NavLink>
          <NavLink
            to="/admin/documents"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-admin-primary/10 text-admin-primary' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <span className="material-symbols-outlined">description</span>
            <span className="text-sm font-medium">Documents</span>
          </NavLink>
          <NavLink
            to="/admin/banners"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-admin-primary/10 text-admin-primary' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <span className="material-symbols-outlined">ads_click</span>
            <span className="text-sm font-medium">Bannières</span>
          </NavLink>
          {user.role === 'admin' && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-admin-primary/10 text-admin-primary' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm font-medium">Utilisateurs</span>
            </NavLink>
          )}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase mb-2">Support & Admin</p>
            <NavLink
              to="/admin/parametres"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-admin-primary/10 text-admin-primary' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Paramètres</span>
            </NavLink>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-sm font-bold overflow-hidden">
              {displayName.slice(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{user.name || user.email}</p>
              <p className="text-[10px] text-admin-primary font-semibold truncate">{roleLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-2 w-full text-xs text-slate-500 hover:text-slate-700"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <Outlet />
      </main>
    </div>
  );
}
