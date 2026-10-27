import type { Product } from '@/types';
import { Cover } from './Cover';

/** 2D stand-in for the hero scene: used on weak devices, with reduced motion, and while the 3D loads. */
export function CoverCollage({ products, compact }: { products: Product[]; compact?: boolean }) {
  const items = products.slice(0, compact ? 2 : 3);
  const size = compact ? 'h-24 w-16' : 'h-32 w-[88px]';
  const tilt = [-12, 4, 14];
  return (
    <div aria-hidden="true" className="absolute right-4 top-16 flex items-start lg:right-24 lg:top-24">
      {items.map((p, i) => (
        <Cover key={p.id} product={p} className={`${size} -ml-3 rounded-md shadow-2xl first:ml-0`} style={{ transform: `rotate(${tilt[i]}deg)` }} />
      ))}
      <div className="-ml-5 mt-8 h-20 w-20 rounded-full shadow-2xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0 14%, #111 15% 100%)' }} />
    </div>
  );
}
