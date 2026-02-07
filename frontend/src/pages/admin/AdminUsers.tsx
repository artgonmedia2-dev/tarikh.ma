import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { adminApi } from '@/api/client';

type UserItem = { id: number; name: string; email: string; role: string };

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  editor: 'Éditeur',
  reader: 'Lecteur',
};
const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: 'bg-admin-primary/10 text-admin-primary border-admin-primary/20',
  editor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  reader: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const PERMISSIONS_CONFIG = [
  { key: 'edit_content', label: 'Édition de contenu', desc: 'Modifier les articles et documents existants.', default: true },
  { key: 'publish_direct', label: 'Publication directe', desc: 'Publier sans validation d\'un admin.', default: false },
  { key: 'access_stats', label: 'Accès aux statistiques', desc: 'Consulter les chiffres d\'audience.', default: true },
  { key: 'delete_right', label: 'Droit de suppression', desc: 'Supprimer définitivement du contenu.', default: false },
  { key: 'technical_mgmt', label: 'Gestion technique', desc: 'Accès aux paramètres du serveur API.', default: false },
];

const ROLE_DESCRIPTION: Record<string, string> = {
  admin: 'Le rôle d\'administrateur dispose de tous les droits : gestion des utilisateurs, du contenu et des paramètres techniques.',
  editor: 'Le rôle d\'éditeur permet de créer, modifier et publier du contenu historique. Il ne possède pas de droits de suppression globale.',
  reader: 'Le rôle de lecteur permet uniquement de consulter le contenu et les statistiques, sans droit de modification.',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeClass(role: string): string {
  return ROLE_BADGE_CLASS[role] ?? ROLE_BADGE_CLASS.reader;
}

export function AdminUsers() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<{ data: UserItem[]; current_page: number; last_page: number; total?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rolesPanelOpen, setRolesPanelOpen] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'reader'>('editor');
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSIONS_CONFIG.map((p) => [p.key, p.default]))
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setLoading(true);
    adminApi.users
      .list({ page, per_page: 10 })
      .then((res) => setData({ ...res, total: (res as { total?: number }).total ?? res.data.length }))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user?.role, page]);

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Supprimer l'utilisateur « ${name} » ?`)) return;
    adminApi.users
      .delete(id)
      .then(() => setData((prev) => prev ? { ...prev, data: prev.data.filter((u) => u.id !== id) } : null))
      .catch((e) => alert((e as Error).message));
  };

  const filteredUsers = data?.data.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (ROLE_LABEL[u.role] ?? u.role).toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const togglePermission = (key: string) => {
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  };

  const resetPermissions = () => {
    setPermissions(Object.fromEntries(PERMISSIONS_CONFIG.map((p) => [p.key, p.default])));
  };

  const usersWithRoleCount = data?.data.filter((u) => u.role === selectedRole).length ?? 0;

  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center bg-white">
        <p className="text-slate-500">Accès réservé aux administrateurs.</p>
        <Link to="/" className="text-admin-primary font-semibold mt-4 inline-block">Retour à l&apos;accueil</Link>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center bg-white">
        <p className="text-slate-500">Veuillez vous connecter.</p>
        <Link to="/login" className="text-admin-primary font-semibold mt-4 inline-block">Connexion</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link to="/admin" className="hover:text-slate-700">Accueil</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span>Administration</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-admin-primary font-semibold">Utilisateurs</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Contrôlez les accès et définissez les permissions de votre équipe éditoriale.
                </p>
              </div>
              <Link
                to="/admin/users/new"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-admin-primary text-white font-bold rounded-lg hover:shadow-lg hover:brightness-110 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                Ajouter un utilisateur
              </Link>
            </div>
          </div>

          {/* Table controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email ou rôle..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRolesPanelOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-admin-primary/10 border border-admin-primary/20 text-admin-primary rounded-lg hover:bg-admin-primary/20 transition-all text-sm font-medium"
              >
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                Rôles
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium"
              >
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filtrer
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Exporter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Chargement…</div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 border-b border-slate-200">Utilisateur</th>
                      <th className="px-6 py-4 border-b border-slate-200">Rôle</th>
                      <th className="px-6 py-4 border-b border-slate-200">Statut du compte</th>
                      <th className="px-6 py-4 border-b border-slate-200">Dernière connexion</th>
                      <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u, index) => (
                      <tr key={u.id} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-admin-primary/10 flex items-center justify-center border border-admin-primary/20 text-admin-primary font-bold text-sm shrink-0">
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <p className="text-slate-900 font-bold text-sm">{u.name}</p>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-[11px] font-bold rounded-full border uppercase tracking-tighter ${getRoleBadgeClass(u.role)}`}
                          >
                            {ROLE_LABEL[u.role] ?? u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-emerald-500" />
                            <span className="text-sm text-slate-700">Actif</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {index === 0 ? 'Il y a 2 heures' : index === 1 ? 'Hier à 14:30' : index === 2 ? 'Il y a 5 jours' : 'En ligne'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 relative">
                            <Link
                              to={`/admin/users/${u.id}/edit`}
                              className="p-2 text-slate-400 hover:text-admin-primary transition-colors rounded-lg"
                              aria-label="Modifier"
                            >
                              <span className="material-symbols-outlined">edit_square</span>
                            </Link>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg"
                                aria-label="Menu actions"
                              >
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>
                              {openMenuId === u.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    aria-hidden
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[140px]">
                                    <Link
                                      to={`/admin/users/${u.id}/edit`}
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                      onClick={() => setOpenMenuId(null)}
                                    >
                                      <span className="material-symbols-outlined text-lg">edit</span>
                                      Modifier
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        handleDelete(u.id, u.name);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <span className="material-symbols-outlined text-lg">delete</span>
                                      Supprimer
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-8 text-slate-500 text-center">Aucun utilisateur trouvé.</p>
            )}
          </div>

          {/* Pagination */}
          {data && data.data.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">
                Affichage de <span className="text-slate-900 font-bold">1 à {filteredUsers.length}</span> sur{' '}
                {data.total ?? data.data.length} utilisateurs
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 text-sm font-medium"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-admin-primary/20 text-admin-primary border border-admin-primary/30 text-sm font-bold"
                >
                  {page}
                </button>
                {data.last_page > 1 && (
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                    disabled={page >= data.last_page}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium"
                  >
                    Suivant
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sidebar Gestion des Rôles — fond blanc ; overlay sur mobile */}
      <aside
        className={`w-full lg:w-96 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20 transition-transform duration-300
          ${rolesPanelOpen ? 'flex fixed lg:relative inset-y-0 right-0 lg:inset-auto' : 'hidden lg:flex'}`}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestion des Rôles</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configuration :{' '}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {selectedRole === 'admin' ? 'Administrateur' : selectedRole === 'editor' ? 'Éditeur' : 'Lecteur'}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRolesPanelOpen(false)}
            className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors lg:hidden"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Role selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Rôle à configurer
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['admin', 'editor', 'reader'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                    selectedRole === r
                      ? 'bg-admin-primary/20 text-admin-primary border-admin-primary/30'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Privilege level card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-blue-500 text-xl">shield_with_heart</span>
              <h3 className="font-bold text-slate-900">Niveau de privilèges</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {ROLE_DESCRIPTION[selectedRole]}
            </p>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Permissions du rôle</h3>
            <div className="space-y-4">
              {PERMISSIONS_CONFIG.map((p) => (
                <div key={p.key} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={permissions[p.key]}
                    onClick={() => togglePermission(p.key)}
                    className={`relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary/50 ${
                      permissions[p.key] ? 'bg-admin-primary border-admin-primary' : 'bg-slate-200 border-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        permissions[p.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                      style={{ marginTop: 2 }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              className="w-full py-3 bg-admin-primary/10 border border-admin-primary/30 text-admin-primary font-bold rounded-lg hover:bg-admin-primary/20 transition-all text-sm"
            >
              Sauvegarder les permissions
            </button>
            <button
              type="button"
              onClick={resetPermissions}
              className="w-full py-2 text-slate-500 text-sm hover:text-slate-700 transition-colors"
            >
              Réinitialiser par défaut
            </button>
          </div>
        </div>

        {/* Users with this role */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500">Utilisateurs avec ce rôle</span>
            <span className="text-xs font-bold text-slate-900">{usersWithRoleCount} membre{usersWithRoleCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex -space-x-2">
            {filteredUsers
              .filter((u) => u.role === selectedRole)
              .slice(0, 5)
              .map((u) => (
                <div
                  key={u.id}
                  className="size-8 rounded-full border-2 border-white bg-admin-primary/20 flex items-center justify-center text-xs font-bold text-slate-700"
                  title={u.name}
                >
                  {getInitials(u.name).slice(0, 1)}
                </div>
              ))}
            {usersWithRoleCount > 5 && (
              <div className="size-8 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                +{usersWithRoleCount - 5}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
