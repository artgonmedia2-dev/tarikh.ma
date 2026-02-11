/**
 * Client API — Laravel backend (Sanctum).
 * Base URL : VITE_API_URL (ex. http://localhost:8000/api)
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') || '/api';

function getToken(): string | null {
  return localStorage.getItem('tarikh_token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | boolean | string[] | undefined> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const token = getToken();
  const headers: HeadersInit = {
    ...(init.method !== 'GET' && typeof (init.body as FormData)?.append !== 'function' ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'Erreur API');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** URL du stream d'un document (pour img/iframe/video — envoi du token si nécessaire côté app) */
export function documentStreamUrl(id: string): string {
  const token = getToken();
  const url = `${API_BASE}/documents/${id}/stream`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: { id: number; email: string; name: string; role: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string, password_confirmation: string, role: string = 'reader') =>
    api<{ token: string; user: { id: number; email: string; name: string; role: string } }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation, role }),
    }),
  user: () => api<{ id: number; email: string; name: string; role: string }>('/user'),
  logout: () => api<{ message: string }>('/logout', { method: 'POST' }),
};

export const themesApi = {
  list: () => api<{ id: number; name: string; slug: string }[]>('/themes'),
};

export const regionsApi = {
  list: () => api<{ id: number; name: string; slug: string }[]>('/regions'),
};

export type DocumentItem = {
  id: number;
  title: string;
  author: string | null;
  description: string | null;
  type: string;
  year: string | null;
  region_id: number | null;
  theme_id: number | null;
  language: string | null;
  keywords: string | null;
  file_path: string;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  views_count: number;
  created_at: string;
  is_rare: boolean;
  region?: { id: number; name: string; slug: string } | null;
  theme?: { id: number; name: string; slug: string } | null;
  pages_count?: number | null;
  pages_status?: string | null;
  pages_converted_at?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  user_id?: number | null;
};

export type BannerItem = {
  id: number;
  title: string;
  image_path: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
};

export type HeritageSectionItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
  image_path: string;
  image_url: string;
  link_url: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

/** Signed URLs for document page images (flipbook). Keys are page numbers as strings. */
export function documentPageSignedUrls(documentId: string, pages: number[]): Promise<Record<string, string>> {
  const list = pages.slice(0, 50).join(',');
  return api<Record<string, string>>(`/documents/${documentId}/pages/urls`, { params: { pages: list } });
}

export const documentsApi = {
  list: (params?: {
    page?: number;
    per_page?: number;
    q?: string;
    region_id?: number;
    theme_id?: number;
    type?: string | string[];
    year?: string;
    year_min?: number;
    year_max?: number;
    is_rare?: boolean;
    language?: string;
    sort_by?: 'latest' | 'oldest' | 'title' | 'views' | 'year_asc' | 'year_desc';
  }) =>
    api<Paginated<DocumentItem>>('/documents', { params: params as Record<string, string | number | undefined | boolean | string[]> }),
  get: (id: string) =>
    api<{ document: DocumentItem & { tags?: unknown[] }; similar: DocumentItem[] }>(`/documents/${id}`),
};

export const bannersApi = {
  list: () => api<BannerItem[]>('/banners'),
};

export type StatsResponse = {
  stats: {
    documents_count: number;
    views_total: number;
    users_count: number;
    new_documents_in_period?: number;
    new_documents_change_percent?: number | null;
  };
  traffic_by_month: { labels: string[]; data: number[] };
  type_distribution: { type: string; count: number; percentage: number }[];
  most_viewed: DocumentItem[];
};

export const adminApi = {
  stats: (params?: { period?: string }) =>
    api<StatsResponse>('/admin/stats', { params: params as Record<string, string | undefined> }),
  documents: {
    list: (params?: { page?: number; per_page?: number }) =>
      api<Paginated<DocumentItem>>('/admin/documents', { params: params as Record<string, number | undefined> }),
    create: (form: FormData) => api<DocumentItem>('/admin/documents', { method: 'POST', body: form }),
    get: (id: number) => api<DocumentItem>(`/admin/documents/${id}`),
    update: (id: number, form: FormData) => api<DocumentItem>(`/admin/documents/${id}`, { method: 'PUT', body: form }),
    delete: (id: number) => api<void>(`/admin/documents/${id}`, { method: 'DELETE' }),
    conversionProgress: (id: number) =>
      api<{ document_id: number; pages_status: string; pages_count: number | null; progress: { current: number; total: number } | null }>(`/admin/documents/${id}/conversion-progress`),
    regeneratePages: (id: number) => api<{ message: string; document: DocumentItem }>(`/admin/documents/${id}/regenerate-pages`, { method: 'POST' }),
  },
  users: {
    list: (params?: { page?: number; per_page?: number }) =>
      api<Paginated<{ id: number; name: string; email: string; role: string }>>('/admin/users', { params: params as Record<string, number | undefined> }),
    get: (id: number) => api<{ id: number; name: string; email: string; role: string }>(`/admin/users/${id}`),
    create: (data: { name: string; email: string; password: string; password_confirmation: string; role: string }) =>
      api<{ id: number; name: string; email: string; role: string }>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { name: string; email: string; role: string; password?: string; password_confirmation?: string }) =>
      api<{ id: number; name: string; email: string; role: string }>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api<void>(`/admin/users/${id}`, { method: 'DELETE' }),
  },
  banners: {
    list: () => api<BannerItem[]>('/admin/banners'),
    create: (form: FormData) => api<BannerItem>('/admin/banners', { method: 'POST', body: form }),
    get: (id: number) => api<BannerItem>(`/admin/banners/${id}`),
    update: (id: number, form: FormData) => api<BannerItem>(`/admin/banners/${id}`, { method: 'POST', body: form, params: { _method: 'PUT' } }),
    delete: (id: number) => api<void>(`/admin/banners/${id}`, { method: 'DELETE' }),
  },
  heritageSections: {
    list: () => api<HeritageSectionItem[]>('/admin/heritage-sections'),
    create: (form: FormData) => api<HeritageSectionItem>('/admin/heritage-sections', { method: 'POST', body: form }),
    get: (id: number) => api<HeritageSectionItem>(`/admin/heritage-sections/${id}`),
    update: (id: number, form: FormData) => api<HeritageSectionItem>(`/admin/heritage-sections/${id}`, { method: 'POST', body: form, params: { _method: 'PUT' } }),
    delete: (id: number) => api<void>(`/admin/heritage-sections/${id}`, { method: 'DELETE' }),
  },
};

// Article types and API
export type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

export type ArticleItem = {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  category_id: number | null;
  cover_image: string | null;
  cover_image_url: string | null;
  admin_comment: string | null;
  tags: string[] | null;
  sources: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: ArticleCategory | null;
  user?: { id: number; name: string; email?: string } | null;
};

export const articlesApi = {
  // Public
  list: (params?: { page?: number; per_page?: number; category_id?: number }) =>
    api<Paginated<ArticleItem>>('/articles', { params: params as Record<string, number | undefined> }),
  get: (slug: string) => api<ArticleItem>(`/articles/${slug}`),
  categories: () => api<ArticleCategory[]>('/article-categories'),

  // User (authenticated)
  myArticles: (params?: { page?: number; per_page?: number; status?: string }) =>
    api<Paginated<ArticleItem>>('/my-articles', { params: params as Record<string, string | number | undefined> }),
  create: (form: FormData) => api<ArticleItem>('/articles', { method: 'POST', body: form }),
  show: (id: number) => api<ArticleItem>(`/articles/${id}/edit`),
  update: (id: number, form: FormData) => api<ArticleItem>(`/articles/${id}`, { method: 'PUT', body: form }),
  delete: (id: number) => api<void>(`/articles/${id}`, { method: 'DELETE' }),
  submit: (id: number) => api<{ message: string; article: ArticleItem }>(`/articles/${id}/submit`, { method: 'POST' }),
};

export const heritageApi = {
  list: () => api<HeritageSectionItem[]>('/heritage-sections'),
};

export const adminArticlesApi = {
  list: (params?: { page?: number; per_page?: number; status?: string; user_id?: number }) =>
    api<Paginated<ArticleItem>>('/admin/articles', { params: params as Record<string, string | number | undefined> }),
  pending: (params?: { page?: number; per_page?: number }) =>
    api<Paginated<ArticleItem>>('/admin/articles/pending', { params: params as Record<string, number | undefined> }),
  stats: () => api<{ total: number; draft: number; pending: number; approved: number; rejected: number }>('/admin/articles/stats'),
  show: (id: number) => api<ArticleItem>(`/admin/articles/${id}`),
  approve: (id: number) => api<{ message: string; article: ArticleItem }>(`/admin/articles/${id}/approve`, { method: 'POST' }),
  reject: (id: number, comment: string) =>
    api<{ message: string; article: ArticleItem }>(`/admin/articles/${id}/reject`, { method: 'POST', body: JSON.stringify({ comment }) }),
};
