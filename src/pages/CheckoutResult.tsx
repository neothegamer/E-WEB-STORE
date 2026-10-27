import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useCart } from '@/store/cart';
import { Icon } from '@/components/Icon';

const POLL_MS = 2000;
const TIMEOUT_MS = 60_000;

export default function CheckoutResult() {
  const [params] = useSearchParams();
  const id = params.get('order') ?? '';
  const qc = useQueryClient();
  const clear = useCart((s) => s.clear);
  const started = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  const q = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.getOrder(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === 'paid' || s === 'failed' || s === 'cancelled') return false;
      return Date.now() - started.current > TIMEOUT_MS ? false : POLL_MS;
    },
  });
  const status = q.data?.status;

  useEffect(() => {
    if (status === 'paid') { clear(); qc.invalidateQueries({ queryKey: ['library'] }); qc.invalidateQueries({ queryKey: ['orders'] }); }
  }, [status, clear, qc]);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  let icon: 'check' | 'x' | null = null;
  let title = 'Confirming your payment';
  let text = 'This usually takes a few seconds. Please keep this page open.';
  let tone = 'bg-accent/15 text-accent';
  let actions: ReactNode = null;

  if (status === 'paid') {
    icon = 'check'; tone = 'bg-ok/15 text-ok'; title = 'Payment successful';
    text = `${q.data!.items.length} ${q.data!.items.length === 1 ? 'item is' : 'items are'} now in your library.`;
    actions = (<><Link to="/library" className="btn btn-primary w-full">Go to my library</Link><Link to="/browse" className="btn btn-ghost mt-3 w-full">Keep browsing</Link></>);
  } else if (status === 'failed' || status === 'cancelled') {
    icon = 'x'; tone = 'bg-bad/15 text-bad'; title = "Payment didn't go through";
    text = "Your bank declined the payment. You haven't been charged.";
    actions = (<><Link to="/cart" className="btn btn-primary w-full">Back to cart</Link><Link to="/browse" className="btn btn-ghost mt-3 w-full">Keep browsing</Link></>);
  } else if (q.isError || !id) {
    title = 'We could not find that order'; text = 'Check your library in a minute, or contact support if you were charged.';
    actions = <Link to="/library" className="btn btn-primary w-full">Go to my library</Link>;
  } else if (timedOut) {
    title = 'Still confirming'; text = 'We are confirming your payment. Check your library in a minute.';
    actions = <Link to="/library" className="btn btn-primary w-full">Go to my library</Link>;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center px-6 pt-20 text-center" aria-live="polite">
      <div className={`grid h-28 w-28 place-items-center rounded-full ${tone}`}>
        {icon ? <Icon name={icon} className="h-12 w-12" /> : <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-accent/25 border-t-accent" />}
      </div>
      <h1 className="h1 mt-7">{title}</h1>
      <p className="mt-2 text-[15px] text-muted">{text}</p>
      <div className="mt-8 w-full">{actions}</div>
      {q.data && <p className="mt-auto pb-8 pt-8 text-xs text-muted">Order {q.data.reference}</p>}
    </div>
  );
}
