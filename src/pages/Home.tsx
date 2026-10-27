import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { useCart } from '@/store/cart';
import { useUi } from '@/store/ui';
import { CoverCollage } from '@/components/CoverCollage';
import { Icon } from '@/components/Icon';
import { HeroStage } from '@/three/Stage';
import type { Product } from '@/types';
import { ProductCard, ProductGrid } from '@/components/ProductCard';
import { ErrorState, GridSkeleton } from '@/components/States';

function Hero({ products }: { products: Product[] }) {
  const openSearch = useUi((s) => s.openSearch);
  const count = useCart((s) => s.items.length);
  return (
    <HeroStage
      products={products}
      fallback={<CoverCollage products={products} />}
      className="relative min-h-[440px] overflow-hidden text-white lg:mx-4 lg:mt-4 lg:min-h-[480px] lg:rounded-card"
    >
      {/* Overlay ignores pointer events so the 3D scene underneath still gets touch and mouse; buttons opt back in. */}
      <div className="pointer-events-none relative z-10 flex min-h-[440px] flex-col justify-between lg:min-h-[480px]">
        <div className="flex items-center justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))] lg:hidden">
          <span className="h2">[BRAND]</span>
          <div className="pointer-events-auto -mr-3 flex">
            <button aria-label="Search" onClick={openSearch} className="grid h-11 w-11 place-items-center"><Icon name="search" /></button>
            <Link to="/cart" aria-label={`Cart, ${count} items`} className="grid h-11 w-11 place-items-center"><Icon name="cart" /></Link>
          </div>
        </div>
        <div className="px-6 pb-12 pt-28 lg:pb-16">
          <h1 className="h1 max-w-xs lg:max-w-md">Preview it. Love it. Keep it.</h1>
          <p className="mt-2 max-w-xs text-sm text-white/80">Read a summary or hear 30 seconds before you buy.</p>
          <div className="pointer-events-auto mt-6 flex flex-wrap gap-2">
            <Link to="/browse?type=book" className="btn btn-primary">Browse books</Link>
            <Link to="/browse?type=music" className="btn border border-white/60 text-white">Browse music</Link>
          </div>
        </div>
      </div>
    </HeroStage>
  );
}

function Section({ title, to, children }: { title: string; to?: string; children: ReactNode }) {
  return (
    <section className="mt-8 px-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="h2">{title}</h2>
        {to && <Link to={to} className="py-2 text-sm font-semibold text-accent">View all</Link>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const featured = useQuery({ queryKey: ['featured'], queryFn: api.getFeatured });
  const music = useQuery({ queryKey: ['products', 'music-row'], queryFn: () => api.listProducts({ type: 'music', limit: 6 }) });
  const fresh = useQuery({ queryKey: ['products', 'new'], queryFn: () => api.listProducts({ sort: 'newest', limit: 8 }) });

  return (
    <div>
      <Hero products={featured.data ?? []} />
      <Section title="Featured">
        {featured.isError ? <ErrorState onRetry={() => featured.refetch()} /> : featured.isLoading ? <GridSkeleton count={2} /> : (
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {featured.data!.map((p) => <div key={p.id} className="w-40 shrink-0 snap-start"><ProductCard product={p} /></div>)}
          </div>
        )}
      </Section>
      <Section title="Listen first" to="/browse?type=music">
        {music.isError ? <ErrorState onRetry={() => music.refetch()} /> : music.isLoading ? <GridSkeleton count={2} /> : (
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {music.data!.items.map((p) => <div key={p.id} className="w-36 shrink-0 snap-start"><ProductCard product={p} /></div>)}
          </div>
        )}
      </Section>
      <Section title="New arrivals" to="/browse">
        {fresh.isError ? <ErrorState onRetry={() => fresh.refetch()} /> : fresh.isLoading ? <GridSkeleton /> : <ProductGrid items={fresh.data!.items} />}
      </Section>
    </div>
  );
}
