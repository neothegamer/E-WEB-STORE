import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { useMe } from '@/hooks/useAuth';
import { useCart } from '@/store/cart';
import { usePlayer } from '@/store/player';
import { useUi } from '@/store/ui';
import { cn, formatPrice, formatTime, PREVIEW_SECONDS } from '@/lib/utils';
import type { Product } from '@/types';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { ProductStage } from '@/three/Stage';
import { ErrorState, Skeleton } from '@/components/States';

function MusicPreview({ product }: { product: Product }) {
  const { current, playing, position, ended, play, toggle } = usePlayer();
  const active = current?.id === product.id;
  const pos = active ? position : 0;
  return (
    <section className="card mx-4 mt-5 p-4" aria-label="30-second preview">
      <h2 className="mb-3 text-[15px] font-bold">30-second preview</h2>
      <div className="flex items-center gap-3">
        <button
          aria-label={active && playing ? 'Pause preview' : 'Play preview'}
          onClick={() => (active ? toggle() : play(product))}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-accent-fg"
        >
          <Icon name={active && playing ? 'pause' : 'play'} className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-pill bg-surface2"><div className="h-full bg-accent" style={{ width: `${(pos / PREVIEW_SECONDS) * 100}%` }} /></div>
          <div className="mt-2 flex justify-between text-xs text-muted"><span>{formatTime(pos)}</span><span>{formatTime(PREVIEW_SECONDS)}</span></div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        {active && ended ? 'That was the preview. Get the full track.' : `Like it? Get the full ${formatTime(product.meta.durationSec ?? 0)} track.`}
      </p>
    </section>
  );
}

function BookSummary({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  if (!product.summary) return null;
  return (
    <section className="card mx-4 mt-5 p-4" aria-label="Preview summary">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Preview summary</h2>
        <span className="rounded-pill bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">AI-generated</span>
      </div>
      <div className={cn('space-y-3 text-[15px] leading-relaxed', !open && 'line-clamp-6')}>
        {product.summary.text.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <button onClick={() => setOpen(!open)} className="mt-2 py-2 text-sm font-bold text-accent" aria-expanded={open}>{open ? 'Show less' : 'Read more'}</button>
    </section>
  );
}

export default function ProductPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.items.some((i) => i.slug === slug));
  const { user } = useMe();
  const q = useQuery({ queryKey: ['product', slug], queryFn: () => api.getProduct(slug) });
  const lib = useQuery({ queryKey: ['library'], queryFn: api.listLibrary, enabled: !!user });

  if (q.isLoading) return <div className="space-y-3 p-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24 w-full" /></div>;
  if (q.isError || !q.data) return <div className="pt-6"><PageHeader title="Not found" back /><ErrorState message="We could not find that item." onRetry={() => navigate('/browse')} /></div>;

  const p = q.data;
  const owned = !!lib.data?.some((l) => l.product.id === p.id);
  const isMusic = p.type === 'music';

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: p.title, url }); } catch { /* cancelled */ } }
    else { await navigator.clipboard?.writeText(url); toast('Link copied'); }
  };

  return (
    <div>
      <PageHeader title="" back right={<button aria-label="Share this item" onClick={share} className="min-h-11 px-3 text-sm font-bold text-accent">Share</button>} />

      <ProductStage
        product={p}
        className="relative h-72 overflow-hidden bg-surface2"
        fallback={<div className="grid h-full place-items-center"><Cover product={p} className={cn('rounded-btn shadow-2xl', isMusic ? 'h-48 w-48' : 'h-56 w-40')} /></div>}
      />

      <div className="px-4 pt-5">
        <h1 className="h1">{p.title}</h1>
        <p className="mt-1 text-sm text-muted">by {p.creator}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="chip min-h-8">{isMusic ? 'Music' : 'Book'}</span>
          {p.meta.format && <span className="chip min-h-8">{p.meta.format}</span>}
          {p.meta.pages && <span className="chip min-h-8">{p.meta.pages} pages</span>}
          {p.meta.durationSec && <span className="chip min-h-8">{formatTime(p.meta.durationSec)}</span>}
        </div>
      </div>

      {isMusic ? <MusicPreview product={p} /> : <BookSummary product={p} />}
      <p className="mx-4 mt-5 text-sm leading-relaxed text-muted">{p.description}</p>

      {/* Sticky buy bar replaces the tab bar on this page */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-[88px] max-w-6xl items-center gap-2 px-4">
          <div className="mr-auto"><p className="text-[11px] text-muted">Price</p><p className="text-xl font-bold">{formatPrice(p.price, p.currency)}</p></div>
          {owned ? (
            <Link to="/library" className="btn btn-primary">In your library</Link>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => { add(p); if (!inCart) toast('Added to cart'); }}>{inCart ? 'In cart' : 'Add to cart'}</button>
              <button className="btn btn-primary" onClick={() => { add(p); navigate('/cart'); }}>Buy now</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
