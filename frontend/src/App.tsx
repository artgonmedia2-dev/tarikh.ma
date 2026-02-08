import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { DocumentLayout } from '@/components/DocumentLayout';
import { AdminLayout } from '@/components/AdminLayout';
import { Accueil } from '@/pages/Accueil';
import { APropos } from '@/pages/APropos';
import { Epoques } from '@/pages/Epoques';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Exploration } from '@/pages/Exploration';
import { DocumentView } from '@/pages/DocumentView';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminDocuments } from '@/pages/admin/AdminDocuments';
import { AdminDocumentForm } from '@/pages/admin/AdminDocumentForm';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminUserForm } from '@/pages/admin/AdminUserForm';
import { AdminParametres } from '@/pages/admin/AdminParametres';
import { AdminBanners } from '@/pages/admin/AdminBanners';
import { useAuthStore } from '@/stores/authStore';

function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      <Route path="/documents/:id" element={<DocumentLayout />}>
        <Route index element={<DocumentView />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="documents/new" element={<AdminDocumentForm />} />
        <Route path="documents/:id/edit" element={<AdminDocumentForm />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/new" element={<AdminUserForm />} />
        <Route path="users/:id/edit" element={<AdminUserForm />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="parametres" element={<AdminParametres />} />
      </Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Accueil />} />
        <Route path="a-propos" element={<APropos />} />
        <Route path="epoques" element={<Epoques />} />
        <Route path="archives" element={<Exploration />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
