import type { AdminApi } from '@/api';
import { ApiError } from '@/api/client';
import type { AdminOrder, AdminProduct, Product, SummaryStatus } from '@/types';
import { categories, products, summaryFor, users } from './data';
import { library, orders, wait } from './baseApi';

interface Meta {
  files: { cover?: string; file?: string; preview?: string };
  summary?: { text: string; status: SummaryStatus; error?: string; edited: boolean; readyAt?: number };
}
const meta: Record<string, Meta> = {};
let autoPublish = false;
let seq = 100;

function metaFor(p: Product): Meta {
  if (!meta[p.id]) {
    const book = p.type === 'book';
    const m: Meta = { files: { cover: 'cover.jpg' } };
    if (p.status === 'published') {
      m.files.file = book ? 'book.pdf' : 'track.mp3';
      if (!book) m.files.preview = 'preview.mp3';
      if (book) m.summary = { text: p.summary?.text ?? summaryFor(p.title), status: 'published', edited: false };
    }
    meta[p.id] = m;
  }
  return meta[p.id];
}

// Initial draft states for the demo: one ready for review, one still generating, one failed
function seedDrafts() {
  const d1 = metaFor(products.find((p) => p.id === 'd1')!); d1.files.file = 'salt-and-silence.pdf';
  d1.summary = { text: summaryFor('Salt and Silence'), status: 'ready', edited: false };
  const d2 = metaFor(products.find((p) => p.id === 'd2')!); d2.files.file = 'coastal-ledger.pdf';
  d2.summary = { text: '', status: 'pending', edited: false, readyAt: Date.now() + 8000 };
  const d3 = metaFor(products.find((p) => p.id === 'd3')!); d3.files.file = 'red-dust-road.pdf';
  d3.summary = { text: '', status: 'failed', error: 'No text found. This may be a scanned PDF.', edited: false };
}
function seedOrders() {
  const mk = (n: number, userId: string, ids: string[], status: 'paid' | 'pending' | 'failed', day: number) => {
    const items = ids.map((id) => products.find((p) => p.id === id)!);
    orders.push({
      id: `o${n}`, userId, reference: `BM-${n}`, status, currency: 'NGN', createdAt: new Date(Date.now() - day * 86400000).toISOString(),
      paidAt: status === 'paid' ? new Date(Date.now() - day * 86400000).toISOString() : undefined,
      items: items.map((p) => ({ productId: p.id, title: p.title, price: p.price })), total: items.reduce((s, p) => s + p.price, 0),
    });
  };
  mk(20417, 'u3', ['b3'], 'pending', 0); mk(20416, 'u4', ['m10'], 'failed', 1); mk(20415, 'u5', ['b1', 'm9', 'm12'], 'paid', 1);
  mk(20414, 'u6', ['b2'], 'paid', 2); mk(20413, 'u3', ['b7', 'm15'], 'paid', 3);
}
seedDrafts();
seedOrders();

/** Summaries move from "pending" to "ready" (or "published" with auto-publish) after a delay. */
function tick() {
  for (const p of products) {
    const s = metaFor(p).summary;
    if (s && s.status === 'pending' && (s.readyAt ?? 0) <= Date.now()) {
      s.text = summaryFor(p.title);
      s.status = autoPublish ? 'published' : 'ready';
      if (autoPublish) p.summary = { text: s.text };
    }
  }
}

function toAdmin(p: Product): AdminProduct {
  const m = metaFor(p);
  return { ...p, files: m.files, summaryAdmin: m.summary && { text: m.summary.text, status: m.summary.status, error: m.summary.error, edited: m.summary.edited } };
}
const find = (id: string) => {
  const p = products.find((x) => x.id === id);
  if (!p) throw new ApiError(404, 'not_found', 'We could not find that product.');
  return p;
};
const toAdminOrder = (o: (typeof orders)[number]): AdminOrder => ({ ...o, userEmail: users.find((u) => u.id === o.userId)?.email ?? 'unknown' });

export const adminApi: AdminApi = {
  async adminStats() {
    await wait(); tick();
    const list = orders.map(toAdminOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      revenue: list.filter((o) => o.status === 'paid').reduce((s, o) => s + o.total, 0),
      orders: list.length, products: products.length,
      summariesToReview: products.filter((p) => metaFor(p).summary?.status === 'ready').length,
      recentOrders: list.slice(0, 3),
    };
  },
  async listAdminProducts({ type, status, review, q } = {}) {
    await wait(); tick();
    let list = [...products].reverse();
    if (type) list = list.filter((p) => p.type === type);
    if (status) list = list.filter((p) => p.status === status);
    if (review) list = list.filter((p) => metaFor(p).summary?.status === 'ready');
    if (q) list = list.filter((p) => (p.title + p.creator).toLowerCase().includes(q.toLowerCase()));
    return list.map(toAdmin);
  },
  async getAdminProduct(id) { await wait(150); tick(); return toAdmin(find(id)); },
  async saveProduct(id, input) {
    await wait();
    if (!input.title.trim() || !input.creator.trim()) throw new ApiError(400, 'validation_error', 'Title and creator are required.');
    if (id) { const p = find(id); Object.assign(p, { ...input, type: p.type }); return toAdmin(p); }
    const n = ++seq;
    const p: Product = {
      ...input, id: `x${n}`, slug: `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${n}`, currency: 'NGN', featured: false,
      meta: { format: input.type === 'book' ? 'PDF' : 'MP3' }, tags: [], status: 'draft', createdAt: new Date().toISOString(),
    };
    products.push(p);
    return toAdmin(p);
  },
  async uploadFile(id, kind, file, onProgress) {
    const p = find(id);
    if (kind === 'file' && p.type === 'book' && !/\.pdf$/i.test(file.name)) throw new ApiError(400, 'invalid_file', 'Books must be PDF files.');
    if ((kind === 'file' || kind === 'preview') && p.type === 'music' && !/\.mp3$/i.test(file.name)) throw new ApiError(400, 'invalid_file', 'Music must be an MP3 file.');
    for (let i = 1; i <= 5; i++) { await wait(180); onProgress(i * 20); }
    const m = metaFor(p);
    m.files[kind] = file.name;
    if (kind === 'file' && p.type === 'book') {
      m.summary = { text: '', status: 'pending', edited: false, readyAt: Date.now() + 7000 };
      p.status = 'draft'; p.summary = undefined; p.meta.pages = 140 + Math.floor(Math.random() * 200);
    }
    if (kind === 'file' && p.type === 'music') { m.files.preview = m.files.preview ?? `preview-${file.name}`; p.meta.durationSec = 215; }
  },
  async setProductStatus(id, status) {
    await wait();
    const p = find(id); const m = metaFor(p);
    if (status === 'published') {
      if (!m.files.file) throw new ApiError(400, 'validation_error', 'Upload the full file before publishing.');
      if (p.type === 'music' && !m.files.preview) throw new ApiError(400, 'validation_error', 'A track needs a preview clip before it can be published.');
      if (p.type === 'book' && m.summary?.status !== 'published') throw new ApiError(400, 'validation_error', 'A book needs an approved summary before it can be published.');
    }
    p.status = status;
    return toAdmin(p);
  },
  async deleteProduct(id) { await wait(); products.splice(products.indexOf(find(id)), 1); },
  async regenerateSummary(id) {
    await wait();
    const p = find(id); const m = metaFor(p);
    if (!m.files.file) throw new ApiError(400, 'validation_error', 'Upload the book file first.');
    m.summary = { text: '', status: 'pending', edited: false, readyAt: Date.now() + 6000 };
    p.summary = undefined; p.status = 'draft';
    return toAdmin(p);
  },
  async updateSummary(id, text) {
    await wait();
    const p = find(id); const m = metaFor(p);
    if (text.trim().split(/\s+/).length < 20) throw new ApiError(400, 'validation_error', 'The summary is too short.');
    const was = m.summary?.status;
    m.summary = { text: text.trim(), status: was === 'published' ? 'published' : 'ready', edited: true };
    if (was === 'published') p.summary = { text: text.trim() };
    return toAdmin(p);
  },
  async approveSummary(id) {
    await wait();
    const p = find(id); const m = metaFor(p);
    if (m.summary?.status !== 'ready') throw new ApiError(400, 'validation_error', 'There is no summary waiting for approval.');
    m.summary.status = 'published'; p.summary = { text: m.summary.text };
    return toAdmin(p);
  },
  async createCategory({ name, type }) {
    await wait(150);
    const c = { id: `c${++seq}`, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), type };
    categories.push(c);
    return c;
  },
  async updateCategory(id, { name, type }) {
    await wait(150);
    const c = categories.find((x) => x.id === id);
    if (!c) throw new ApiError(404, 'not_found', 'Category not found.');
    Object.assign(c, { name, type, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
    return c;
  },
  async deleteCategory(id) {
    await wait(150);
    if (products.some((p) => p.categoryIds.includes(id))) throw new ApiError(409, 'in_use', 'This category is used by products. Move them first.');
    categories.splice(categories.findIndex((c) => c.id === id), 1);
  },
  async listAdminOrders() { await wait(); return orders.map(toAdminOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
  async listAdminUsers() {
    await wait();
    return users.map((u, i) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: new Date(Date.now() - (i + 1) * 5 * 86400000).toISOString(), itemsCount: (library[u.id] ?? []).length }));
  },
  async grantItem(userId, productId) {
    await wait();
    if ((library[userId] ?? []).some((l) => l.productId === productId)) throw new ApiError(409, 'already_owned', 'This user already owns that item.');
    library[userId] = [...(library[userId] ?? []), { productId, acquiredAt: new Date().toISOString() }];
  },
  async getSettings() { await wait(100); return { autoPublishSummaries: autoPublish }; },
  async updateSettings(s) { await wait(150); autoPublish = s.autoPublishSummaries; return { autoPublishSummaries: autoPublish }; },
};
