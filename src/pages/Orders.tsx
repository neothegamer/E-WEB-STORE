import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { formatPrice, cn } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';

const TONE = { paid: 'bg-ok/15 text-ok', pending: 'bg-warn/15 text-warn', failed: 'bg-bad/15 text-bad', cancelled: 'bg-surface2 text-muted' } as const;

export default function Orders() {
  const q = useQuery({ queryKey: ['orders'], queryFn: api.listOrders });
  return (
    <div>
      <PageHeader title="Orders" back />
      {q.isLoading ? <div className="space-y-3 px-4"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        : q.isError ? <ErrorState onRetry={() => q.refetch()} />
        : q.data!.length === 0 ? <EmptyState title="No orders yet" message="Your purchases will be listed here." />
        : <ul className="space-y-3 px-4">{q.data!.map((o) => (
            <li key={o.id} className="card p-4 text-sm">
              <div className="flex items-center justify-between"><b>{o.reference}</b><span className={cn('rounded-pill px-2.5 py-1 text-[11px] font-semibold capitalize', TONE[o.status])}>{o.status}</span></div>
              <p className="mt-1 text-xs text-muted">{new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items.length} {o.items.length === 1 ? 'item' : 'items'}</p>
              <p className="mt-2 font-bold">{formatPrice(o.total, o.currency)}</p>
            </li>))}</ul>}
    </div>
  );
}
