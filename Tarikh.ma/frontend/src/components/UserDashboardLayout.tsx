import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function UserDashboardLayout() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <NavLink to="/" className="flex items-center gap-2 text-slate-900 hover:text-accent-gold transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span className="text-sm font-medium">Retour au site</span>
                        </NavLink>
                        <span className="text-slate-300">|</span>
                        <h1 className="text-lg font-bold text-slate-900">Mon Espace</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{user.name || user.email}</span>
                        <button
                            type="button"
                            onClick={() => logout()}
                            className="text-sm text-slate-500 hover:text-accent-gold transition-colors"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex gap-8 p-6">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0">
                    <nav className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 sticky top-24">
                        <NavLink
                            to="/dashboard"
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-accent-gold/10 text-accent-gold font-bold' : 'text-slate-600 hover:bg-slate-50'}`
                            }
                        >
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                            <span className="text-sm">Tableau de bord</span>
                        </NavLink>
                        <NavLink
                            to="/dashboard/articles"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-accent-gold/10 text-accent-gold font-bold' : 'text-slate-600 hover:bg-slate-50'}`
                            }
                        >
                            <span className="material-symbols-outlined text-xl">article</span>
                            <span className="text-sm">Mes articles</span>
                        </NavLink>
                        <NavLink
                            to="/dashboard/articles/new"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-accent-gold/10 text-accent-gold font-bold' : 'text-slate-600 hover:bg-slate-50'}`
                            }
                        >
                            <span className="material-symbols-outlined text-xl">edit_note</span>
                            <span className="text-sm">Rédiger un article</span>
                        </NavLink>

                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase mb-2">Aide</p>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">help</span>
                                <span className="text-sm">Guide de rédaction</span>
                            </a>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
