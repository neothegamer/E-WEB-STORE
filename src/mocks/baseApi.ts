import type { ShopApi } from '@/api';
import { ApiError } from '@/api/client';
import type { LibraryItem, Order, Product, User } from '@/types';
import { categories, products, users } from './data';

export const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const KEY = 'mock_user';

// In-memory state (resets on reload, except the logged-in mock user)
export const library: Record<string, { productId: string; acquiredAt: string }[]> = {
  u1: [
    { productId: 'b1', acquiredAt: '2026-10-22T14:08:00Z' },
    { productId: 'm9', acquiredAt: '2026-10-22T14:08:00Z' },
  ],
};
export const orders: (Order & { userId: string })[] = [];
let orderSeq = 20418;

export function currentUser(): User | null {
  const id = localStorage.getItem(KEY);
  return users.find((u) => u.id === id) ?? null;
}
export function requireUser(): User {
  const u = currentUser();
  if (!u) throw new ApiError(401, 'unauthenticated', 'Please log in to continue.');
  return u;
}
const publish = (p: Product) => p.status === 'published';

export const baseApi: ShopApi = {
  async register({ name, email, password }) {
    await wait();
    if (password.length < 8) throw new ApiError(400, 'validation_error', 'Password must be at least 8 characters.');
    if (users.some((u) => u.email === email.toLowerCase())) throw new ApiError(409, 'email_taken', 'An account with this email already exists.');
    const user: User = { id: `u${users.length + 1}`, name, email: email.toLowerCase(), role: 'buyer' };
    users.push(user);
    localStorage.setItem(KEY, user.id);
    return user;
  },
  async login({ email, password }) {
    await wait();
    const user = users.find((u) => u.email === email.toLowerCase());
    if (!user || password.length < 1) throw new ApiError(401, 'invalid_credentials', 'Incorrect email or password.');
    localStorage.setItem(KEY, user.id);
    return user;
  },
  async logout() {
    await wait(100);
    localStorage.removeItem(KEY);
  },
  async me() {
    await wait(100);
    return currentUser();
  },
  async forgotPassword() { await wait(); },
  async resetPassword({ password }) {
    await wait();
    if (password.length < 8) throw new ApiError(400, 'validation_error', 'Password must be at least 8 characters.');
  },

  async listProducts({ type, category, q, sort = 'newest', page = 1, limit = 8 } = {}) {
    await wait();
    const catId = categories.find((c) => c.slug === category)?.id;
    let items = products.filter(publish);
    if (type) items = items.filter((p) => p.type === type);
    if (catId) items = items.filter((p) => p.categoryIds.includes(catId));
    if (q) {
      const s = q.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(s) || p.creator.toLowerCase().includes(s));
    }
    if (sort === 'price_asc') items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') items = [...items].sort((a, b) => b.price - a.price);
    else items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    return { items: items.slice((page - 1) * limit, page * limit), total, page, pages };
  },
  async getFeatured() {
    await wait();
    return products.filter((p) => publish(p) && p.featured);
  },
  async getProduct(slug) {
    await wait();
    const p = products.find((x) => x.slug === slug && publish(x));
    if (!p) throw new ApiError(404, 'not_found', 'We could not find that item.');
    return p;
  },
  async listCategories() {
    await wait(100);
    return categories;
  },

  async checkout(productIds) {
    await wait(400);
    const user = requireUser();
    const owned = new Set((library[user.id] ?? []).map((l) => l.productId));
    const items = products.filter((p) => productIds.includes(p.id));
    if (items.some((p) => owned.has(p.id))) throw new ApiError(409, 'already_owned', 'You already own one of these items.');
    if (!items.length) throw new ApiError(400, 'empty_cart', 'Your cart is empty.');
    const order: Order & { userId: string } = {
      id: `o${orderSeq}`, userId: user.id, reference: `BM-${orderSeq++}`, status: 'pending', currency: 'NGN',
      items: items.map((p) => ({ productId: p.id, title: p.title, price: p.price })),
      total: items.reduce((s, p) => s + p.price, 0), createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    // Simulate the payment webhook arriving a few seconds later
    setTimeout(() => {
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      library[user.id] = [...(library[user.id] ?? []), ...items.map((p) => ({ productId: p.id, acquiredAt: order.paidAt! }))];
    }, 3500);
    return { orderId: order.id, checkoutUrl: `/checkout/result?order=${order.id}` };
  },
  async getOrder(id) {
    await wait(150);
    const user = requireUser();
    const o = orders.find((x) => x.id === id && x.userId === user.id);
    if (!o) throw new ApiError(404, 'not_found', 'We could not find that order.');
    return o;
  },
  async listOrders() {
    await wait();
    const user = requireUser();
    return orders.filter((o) => o.userId === user.id);
  },
  async listLibrary() {
    await wait();
    const user = requireUser();
    return (library[user.id] ?? []).map<LibraryItem>((l) => ({ product: products.find((p) => p.id === l.productId)!, acquiredAt: l.acquiredAt }));
  },
  async getDownloadUrl(productId) {
    await wait(300);
    const user = requireUser();
    if (!(library[user.id] ?? []).some((l) => l.productId === productId)) throw new ApiError(403, 'forbidden', 'You do not own this item.');
    return { url: '#mock-download', expiresAt: new Date(Date.now() + 5 * 60000).toISOString() };
  },
};
