import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { useMe } from '@/hooks/useAuth';
import { useCart } from '@/store/cart';
import { useUi } from '@/store/ui';
import { formatPrice } from '@/lib/utils';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/States';

export default function Cart() {
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const { items, remove } = useCart();
  const { user } = useMe();
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const lib = useQuery({ queryKey: ['library'], queryFn: api.listLibrary, enabled: !!user });
  const owned = new Set(lib.data?.map((l) => l.product.id));
  const payable = items.filter((i) => !owned.has(i.id));
  const total = payable.reduce((s, i) => s + i.price, 0);

  const checkout = async () => {
    if (!user) return navigate('/login?next=/cart');
    setBusy(true);
    try {
      const r = await api.checkout(payable.map((i) => i.id));
      setRedirecting(true);
      if (/^https?:/.test(r.checkoutUrl)) window.location.href = r.checkoutUrl;
      else navigate(r.checkoutUrl);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Checkout failed. Try again.', 'error');
      setBusy(false);
    }
  };

  if (redirecting) {
    return <div className="grid min-h-[60dvh] place-items-center px-6 text-center"><p className="h2">Taking you to secure payment...</p></div>;
  }
  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Your cart" />
        <EmptyState title="Your cart is empty" message="Preview a book summary or a 30-second clip, then add it here." action={<Link to="/browse" className="btn btn-primary">Browse the store</Link>} />
      </div>
    );
  }
  return (
    <div className="pb-24">
      <PageHeader title={`Your cart (${items.length})`} />
      <ul className="space-y-3 px-4">
        {items.map((i) => (
          <li key={i.id} className="card relative flex gap-3 p-3">
            <Cover product={{ id: i.id, title: i.title }} className="h-[88px] w-16 rounded-md" />
            <div className="min-w-0 flex-1 pr-8 text-xs text-muted">
              <Link to={`/product/${i.slug}`} className="block truncate text-sm font-semibold text-fg">{i.title}</Link>
              {i.creator}
              <p className="mt-2 text-sm font-bold text-accent">{formatPrice(i.price, i.currency)}</p>
              {owned.has(i.id) && <p className="mt-1 text-warn">You already own this. It will not be charged.</p>}
            </div>
            <button aria-label={`Remove ${i.title}`} onClick={() => remove(i.id)} className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted"><Icon name="x" className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      <p className="mx-4 mt-4 flex items-center gap-2 text-xs text-muted"><Icon name="check" className="h-4 w-4 text-ok" /> Instant access after payment. Download anytime from your library.</p>
      <dl className="card mx-4 mt-4 space-y-2 p-4 text-sm">
        <div className="flex justify-between text-muted"><dt>Subtotal ({payable.length} items)</dt><dd>{formatPrice(total)}</dd></div>
        <div className="flex justify-between text-muted"><dt>Fees</dt><dd>{formatPrice(0)}</dd></div>
        <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
      </dl>
      <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t border-border bg-surface px-4 py-3 lg:bottom-0">
        <div className="mr-auto"><p className="text-[11px] text-muted">Total</p><p className="text-xl font-bold">{formatPrice(total)}</p></div>
        <button className="btn btn-primary" onClick={checkout} disabled={busy || payable.length === 0}>{busy ? 'Please wait...' : user ? 'Pay securely' : 'Log in to pay'}</button>
      </div>
    </div>
  );
}
