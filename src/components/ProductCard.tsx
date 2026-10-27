import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { usePlayer } from '@/store/player';
import { useUi } from '@/store/ui';
import { Cover } from './Cover';
import { Icon } from './Icon';

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.items.some((i) => i.id === product.id));
  const play = usePlayer((s) => s.play);
  const toast = useUi((s) => s.toast);
  const isMusic = product.type === 'music';

  return (
    <article className="card relative p-2">
      <div className="relative">
        <Link to={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <Cover product={product} className={cn('w-full rounded-btn', isMusic ? 'aspect-square' : 'aspect-[3/4]')} />
        </Link>
        <span className="pointer-events-none absolute left-2 top-2 rounded-pill bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
          {isMusic ? 'Music' : 'Book'}
        </span>
        {isMusic && (
          <button
            aria-label={`Play 30-second preview of ${product.title}`}
            onClick={() => play(product)}
            className="absolute bottom-1 right-1 grid h-11 w-11 place-items-center"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-fg shadow">
              <Icon name="play" className="h-4 w-4" />
            </span>
          </button>
        )}
      </div>
      <Link to={`/product/${product.slug}`} className="mt-2 block">
        <h3 className="truncate text-[13px] font-semibold">{product.title}</h3>
        <p className="truncate text-xs text-muted">{product.creator}</p>
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm font-bold text-accent">{formatPrice(product.price, product.currency)}</span>
        <button
          aria-label={inCart ? `${product.title} is in your cart` : `Add ${product.title} to cart`}
          onClick={() => { add(product); if (!inCart) toast('Added to cart'); }}
          className="-my-2.5 -mr-2 grid h-11 w-11 place-items-center text-fg"
        >
          <Icon name={inCart ? 'check' : 'plus'} />
        </button>
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
