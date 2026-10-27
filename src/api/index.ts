import type {
  AdminOrder, AdminProduct, AdminProductQuery, AdminStats, AdminUser, AppSettings, Category, FileKind, LibraryItem, Order,
  Product, ProductInput, ProductPage, ProductQuery, User,
} from '@/types';
import { ApiError, http, qs, uploadWithProgress, USE_MOCKS } from './client';
import { mockApi } from '@/mocks/mockApi';

/** Shop and account calls. */
export interface ShopApi {
  register(i: { name: string; email: string; password: string }): Promise<User>;
  login(i: { email: string; password: string }): Promise<User>;
  logout(): Promise<void>;
  me(): Promise<User | null>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(i: { token: string; password: string }): Promise<void>;
  listProducts(q?: ProductQuery): Promise<ProductPage>;
  getFeatured(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product>;
  listCategories(): Promise<Category[]>;
  checkout(productIds: string[]): Promise<{ orderId: string; checkoutUrl: string }>;
  getOrder(id: string): Promise<Order>;
  listOrders(): Promise<Order[]>;
  listLibrary(): Promise<LibraryItem[]>;
  getDownloadUrl(productId: string): Promise<{ url: string; expiresAt: string }>;
}

/** Admin calls (all require the admin role on the server). */
export interface AdminApi {
  adminStats(): Promise<AdminStats>;
  listAdminProducts(q?: AdminProductQuery): Promise<AdminProduct[]>;
  getAdminProduct(id: string): Promise<AdminProduct>;
  saveProduct(id: string | null, input: ProductInput): Promise<AdminProduct>;
  uploadFile(id: string, kind: FileKind, file: File, onProgress: (pct: number) => void): Promise<void>;
  setProductStatus(id: string, status: 'draft' | 'published'): Promise<AdminProduct>;
  deleteProduct(id: string): Promise<void>;
  regenerateSummary(id: string): Promise<AdminProduct>;
  updateSummary(id: string, text: string): Promise<AdminProduct>;
  approveSummary(id: string): Promise<AdminProduct>;
  createCategory(i: { name: string; type: Category['type'] }): Promise<Category>;
  updateCategory(id: string, i: { name: string; type: Category['type'] }): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  listAdminOrders(): Promise<AdminOrder[]>;
  listAdminUsers(): Promise<AdminUser[]>;
  grantItem(userId: string, productId: string): Promise<void>;
  getSettings(): Promise<AppSettings>;
  updateSettings(s: AppSettings): Promise<AppSettings>;
}

export type Api = ShopApi & AdminApi;

const none = () => undefined;

const realApi: Api = {
  register: (i) => http.post<{ user: User }>('/auth/register', i).then((r) => r.user),
  login: (i) => http.post<{ user: User }>('/auth/login', i).then((r) => r.user),
  logout: () => http.post('/auth/logout').then(none),
  me: () =>
    http.get<{ user: User }>('/auth/me').then(
      (r) => r.user,
      (e) => {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    ),
  forgotPassword: (email) => http.post('/auth/forgot-password', { email }).then(none),
  resetPassword: (i) => http.post('/auth/reset-password', i).then(none),
  listProducts: (q = {}) => http.get<ProductPage>(`/products${qs({ ...q })}`),
  getFeatured: () => http.get<Product[]>('/products/featured'),
  getProduct: (slug) => http.get<Product>(`/products/${slug}`),
  listCategories: () => http.get<Category[]>('/categories'),
  checkout: (productIds) => http.post<{ orderId: string; checkoutUrl: string }>('/checkout', { productIds }),
  getOrder: (id) => http.get<Order>(`/orders/${id}`),
  listOrders: () => http.get<Order[]>('/orders'),
  listLibrary: () => http.get<LibraryItem[]>('/library'),
  getDownloadUrl: (productId) => http.get<{ url: string; expiresAt: string }>(`/library/${productId}/download`),

  adminStats: () => http.get<AdminStats>('/admin/stats'),
  listAdminProducts: (q = {}) => http.get<AdminProduct[]>(`/admin/products${qs({ type: q.type, status: q.status, review: q.review ? 1 : undefined, q: q.q })}`),
  getAdminProduct: (id) => http.get<AdminProduct>(`/admin/products/${id}`),
  saveProduct: (id, input) => (id ? http.put<AdminProduct>(`/admin/products/${id}`, input) : http.post<AdminProduct>('/admin/products', input)),
  uploadFile: (id, kind, file, onProgress) => uploadWithProgress(`/admin/products/${id}/files/${kind}`, file, onProgress).then(none),
  setProductStatus: (id, status) => http.patch<AdminProduct>(`/admin/products/${id}/status`, { status }),
  deleteProduct: (id) => http.del(`/admin/products/${id}`).then(none),
  regenerateSummary: (id) => http.post<AdminProduct>(`/admin/products/${id}/summary/regenerate`),
  updateSummary: (id, text) => http.patch<AdminProduct>(`/admin/products/${id}/summary`, { text }),
  approveSummary: (id) => http.post<AdminProduct>(`/admin/products/${id}/summary/approve`),
  createCategory: (i) => http.post<Category>('/admin/categories', i),
  updateCategory: (id, i) => http.put<Category>(`/admin/categories/${id}`, i),
  deleteCategory: (id) => http.del(`/admin/categories/${id}`).then(none),
  listAdminOrders: () => http.get<AdminOrder[]>('/admin/orders'),
  listAdminUsers: () => http.get<AdminUser[]>('/admin/users'),
  grantItem: (userId, productId) => http.post('/admin/grants', { userId, productId }).then(none),
  getSettings: () => http.get<AppSettings>('/admin/settings'),
  updateSettings: (s) => http.put<AppSettings>('/admin/settings', s),
};

export const api: Api = USE_MOCKS ? mockApi : realApi;
