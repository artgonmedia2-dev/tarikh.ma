import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors ${isMenuOpen ? 'bg-parchment' : 'glass-nav'} border-b border-accent-gold/20 px-6 lg:px-20 py-4`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-accent-gold">
            <span className="material-symbols-outlined text-3xl">auto_stories</span>
          </span>
          <h2 className="text-slate-900 text-2xl font-black tracking-tighter italic">
            Tarikh<span className="text-accent-gold">.ma</span>
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <NavLink
            to="/archives"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-accent-gold' : 'text-slate-600 hover:text-accent-gold'}`
            }
          >
            Collections
          </NavLink>
          <NavLink
            to="/contribuer"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-accent-gold' : 'text-slate-600 hover:text-accent-gold'}`
            }
          >
            Contribuer
          </NavLink>
          <Link to="/archives" className="text-slate-600 hover:text-accent-gold text-sm font-medium transition-colors">
            Archives
          </Link>
          <NavLink
            to="/a-propos"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-accent-gold' : 'text-slate-600 hover:text-accent-gold'}`
            }
          >
            À propos
          </NavLink>
          {(user?.role === 'admin' || user?.role === 'editor') && (
            <Link to="/admin" className="text-sm font-medium text-accent-gold hover:text-accent-gold/80">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-slate-600 hover:text-accent-gold text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="hidden sm:flex text-slate-600 text-sm font-bold items-center gap-1 hover:text-accent-gold transition-colors"
                  aria-label="Langue FR / AR"
                >
                  <span className="material-symbols-outlined text-lg">language</span>
                  FR / AR
                </button>
                <Link
                  to="/login"
                  className="bg-accent-gold hover:bg-accent-gold/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-accent-gold/20"
                >
                  Connexion
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-600 hover:text-accent-gold transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[76px] bg-[#ffffff] z-[100] flex flex-col p-6 animate-fade-in shadow-2xl overflow-y-auto">
          <nav className="flex flex-col gap-6 mb-8">
            <NavLink
              to="/archives"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-semibold transition-colors ${isActive ? 'text-accent-gold' : 'text-slate-900 border-b border-slate-100 pb-2'}`
              }
            >
              Collections
            </NavLink>
            <NavLink
              to="/contribuer"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-semibold transition-colors ${isActive ? 'text-accent-gold' : 'text-slate-900 border-b border-slate-100 pb-2'}`
              }
            >
              Contribuer
            </NavLink>
            <Link
              to="/archives"
              onClick={closeMenu}
              className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2"
            >
              Archives
            </Link>
            <NavLink
              to="/a-propos"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-semibold transition-colors ${isActive ? 'text-accent-gold' : 'text-slate-900 border-b border-slate-100 pb-2'}`
              }
            >
              À propos
            </NavLink>
            {(user?.role === 'admin' || user?.role === 'editor') && (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="text-lg font-semibold text-accent-gold border-b border-slate-100 pb-2"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
            {user ? (
              <div className="flex flex-col gap-4">
                <span className="text-sm text-slate-500 font-medium">{user.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="w-full bg-slate-100 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 text-slate-600 font-bold py-2"
                >
                  <span className="material-symbols-outlined">language</span>
                  FR / AR
                </button>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="w-full bg-accent-gold text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg shadow-accent-gold/20"
                >
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
