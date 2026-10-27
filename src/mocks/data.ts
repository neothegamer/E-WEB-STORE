import type { Category, Product, User } from '@/types';

export const users: (User & { password?: string })[] = [
  { id: 'u1', name: 'Ada Obi', email: 'ada@example.com', role: 'buyer' },
  { id: 'u2', name: 'Store Owner', email: 'admin@example.com', role: 'admin' },
  { id: 'u3', name: 'Tolu Bello', email: 'tolu@example.com', role: 'buyer' },
  { id: 'u4', name: 'Dayo Kalu', email: 'dayo@example.com', role: 'buyer' },
  { id: 'u5', name: 'Kemi Ade', email: 'kemi@example.com', role: 'buyer' },
  { id: 'u6', name: 'Sade Eze', email: 'sade@example.com', role: 'buyer' },
];

export const categories: Category[] = [
  { id: 'c1', name: 'Fiction', slug: 'fiction', type: 'book' },
  { id: 'c2', name: 'Non-fiction', slug: 'non-fiction', type: 'book' },
  { id: 'c3', name: 'Business', slug: 'business', type: 'book' },
  { id: 'c4', name: 'Self-help', slug: 'self-help', type: 'book' },
  { id: 'c5', name: 'Afrobeats', slug: 'afrobeats', type: 'music' },
  { id: 'c6', name: 'Gospel', slug: 'gospel', type: 'music' },
  { id: 'c7', name: 'Hip-hop', slug: 'hip-hop', type: 'music' },
  { id: 'c8', name: 'Classical', slug: 'classical', type: 'music' },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const summaryFor = (title: string) =>
  `${title} follows an ordinary person who is pulled into something much bigger than a single decision. ` +
  `Each chapter costs the lead a friend, a favour or a secret, and the closer the truth gets, the harder it is to walk away.\n\n` +
  `It is a warm, fast-moving story about money, loyalty and what people owe one another. ` +
  `Readers who enjoy tight plots and characters who feel real will find plenty to hold on to, and a finish that earns its quiet.`;

let n = 0;
function book(title: string, creator: string, naira: number, cat: string, pages: number, featured = false): Product {
  n++;
  return {
    id: `b${n}`, type: 'book', title, slug: slugify(title), creator, price: naira * 100, currency: 'NGN', featured,
    description: `A ${cat.toLowerCase()} read of ${pages} pages by ${creator}.`,
    summary: { text: summaryFor(title) }, meta: { pages, format: 'PDF' },
    categoryIds: [categories.find((c) => c.name === cat)!.id], tags: [], status: 'published',
    createdAt: new Date(Date.now() - n * 86400000).toISOString(),
  };
}
function track(title: string, creator: string, naira: number, cat: string, durationSec: number, featured = false): Product {
  n++;
  return {
    id: `m${n}`, type: 'music', title, slug: slugify(title), creator, price: naira * 100, currency: 'NGN', featured,
    description: `A ${cat.toLowerCase()} track by ${creator}.`,
    meta: { durationSec, format: 'MP3', previewSec: 30 },
    categoryIds: [categories.find((c) => c.name === cat)!.id], tags: [], status: 'published',
    createdAt: new Date(Date.now() - n * 86400000).toISOString(),
  };
}

export const products: Product[] = [
  book('The Lagos Ledger', 'Ada Obi', 2500, 'Fiction', 312, true),
  book('Night Bus Poems', 'T. Bello', 1800, 'Fiction', 96),
  book('Quiet Money', 'S. Eze', 2200, 'Business', 240, true),
  book('Slow Burn', 'Dayo Kalu', 1500, 'Self-help', 180),
  book('The Salt Road', 'Amara Nwosu', 2000, 'Non-fiction', 280),
  book('Ten Small Habits', 'Femi Ade', 1200, 'Self-help', 150),
  book('Market Women', 'Ngozi Eke', 2600, 'Business', 330, true),
  book('Harmattan Letters', 'Tunde Ojo', 1700, 'Fiction', 204),
  track('Afterglow', 'Kemi Ade', 900, 'Afrobeats', 222, true),
  track('Midnight Run', 'Dayo K.', 900, 'Hip-hop', 198),
  track('Sunday Rain', 'Kemi Ade', 700, 'Gospel', 245),
  track('Lagos Nights', 'Kemi Ade', 900, 'Afrobeats', 210, true),
  track('Slow Dance Home', 'Ife Bassey', 800, 'Afrobeats', 236),
  track('Morning Psalm', 'Choir of Light', 600, 'Gospel', 280),
  track('Concrete Kings', 'Rex Ola', 900, 'Hip-hop', 187),
  track('Nocturne in Lagos', 'M. Adeyemi', 1000, 'Classical', 312, true),
];

// Drafts only the admin can see
function draft(id: string, type: 'book' | 'music', title: string, creator: string, naira: number, cat: string): Product {
  return {
    id, type, title, slug: slugify(title), creator, price: naira * 100, currency: 'NGN', featured: false, description: '',
    meta: type === 'book' ? { format: 'PDF' } : { format: 'MP3' },
    categoryIds: [categories.find((c) => c.name === cat)!.id], tags: [], status: 'draft', createdAt: new Date().toISOString(),
  };
}
products.push(
  draft('d1', 'book', 'Salt and Silence', 'Amara Nwosu', 2300, 'Fiction'),
  draft('d2', 'book', 'Coastal Ledger', 'Tunde Ojo', 1900, 'Business'),
  draft('d3', 'book', 'Red Dust Road', 'Ife Bassey', 1400, 'Non-fiction'),
  draft('d4', 'music', 'Raw Take', 'Rex Ola', 700, 'Hip-hop'),
);
