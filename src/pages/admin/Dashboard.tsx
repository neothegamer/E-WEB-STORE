import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { formatPrice } from '@/lib/utils';
import { AdminHeader, StatusChip } from '@/components/admin/ui';
import { ErrorState, Skeleton } from '@/components/States';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const q = useQuery({ queryKey: ['admin', 'stats'], queryFn: api.adminStats });
  if (q.isError) return <><AdminHeader title="Dashboard" /><ErrorState onRetry={() => q.refetch()} /></>;
  const s = q.data;
  const cards = s ? [
    { label: 'Revenue', value: formatPrice(s.revenue), to: '/admin/orders', note: 'From paid orders' },
    { label: 'Orders', value: String(s.orders), to: '/admin/orders', note: 'All time' },
    { label: 'Products', value: String(s.products), to: '/admin/products', note: 'Books and music' },
    { label: 'Summaries to review', value: String(s.summariesToReview), to: '/admin/products?review=1', note: s.summariesToReview ? 'Review now' : 'All caught up', hl: s.summariesToReview > 0 },
  ] : [];
  return (
    <div className="pb-10">
      <AdminHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4">
        {q.isLoading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />) : cards.map((c) => (
          <Link key={c.label} to={c.to} className={cn('card p-4', c.hl && 'border-2 border-accent')}>
            <p className="text-xs text-muted">{c.label}</p>
            <p className="h2 mt-1">{c.value}</p>
            <p className={cn('mt-1 text-[11px]', c.hl ? 'font-bold text-accent' : 'text-ok')}>{c.note}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex items-baseline justify-between px-4"><h2 className="h2">Recent orders</h2><Link to="/admin/orders" className="py-2 text-sm font-semibold text-accent">View all</Link></div>
      <ul className="mt-2 space-y-2 px-4">
        {s?.recentOrders.map((o) => (
          <li key={o.id} className="card flex items-center gap-3 p-3 text-xs text-muted">
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-fg">{o.reference}</p>{o.userEmail}</div>
            <div className="text-right"><p className="text-sm font-bold text-fg">{formatPrice(o.total)}</p><StatusChip tone={o.status === 'paid' ? 'ok' : o.status === 'pending' ? 'warn' : 'bad'}>{o.status}</StatusChip></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
