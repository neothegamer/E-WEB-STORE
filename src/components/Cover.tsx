import type { CSSProperties } from 'react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

// Generated artwork until the client uploads real covers
const PALETTE = [
  ['#D9822B', '#7a3b12'], ['#8a4fff', '#2a1466'], ['#2F5D50', '#0f2a24'],
  ['#e8c9a0', '#9a6a3a'], ['#2b2b2b', '#000000'], ['#cfd8dc', '#78909c'],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function coverColors(id: string): string[] {
  return PALETTE[hash(id) % PALETTE.length];
}

export function Cover({ product, className, style }: { product: Pick<Product, 'id' | 'title' | 'coverUrl'>; className?: string; style?: CSSProperties }) {
  if (product.coverUrl) {
    return <img src={product.coverUrl} alt={`Cover of ${product.title}`} className={cn('shrink-0 object-cover', className)} style={style} />;
  }
  const [a, b] = coverColors(product.id);
  return <div aria-hidden="true" className={cn('shrink-0', className)} style={{ background: `linear-gradient(160deg, ${a}, ${b})`, ...style }} />;
}
