import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import type { AdminProduct, ProductType } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { AdminHeader, StatusChip } from '@/components/admin/ui';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';

function SummaryChip({ p }: { p: AdminProduct }) {
  if (p.type === 'music') return <StatusChip tone={p.files.preview ? 'ok' : 'muted'}>{p.files.preview ? 'Preview clip ready' : 'No preview yet'}</StatusChip>;
  const s = p.summaryAdmin;
  if (!s) return <StatusChip>No file yet</StatusChip>;
  if (s.status === 'pending') return <StatusChip>Generating summary...</StatusChip>;
  if (s.status === 'ready') return <StatusChip tone="warn">Ready for review</StatusChip>;
  if (s.status === 'published') return <StatusChip tone="ok">Summary published</StatusChip>;
  return <StatusChip tone="bad">Failed: {s.error?.split('.')[0].toLowerCase()}</StatusChip>;
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const type = (params.get('type') || '') as ProductType | '';
  const status = (params.get('status') || '') as 'draft' | 'published' | '';
  const review = params.get('review') === '1';
  const q = params.get('q') || '';
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };
  const list = useQuery({
    queryKey: ['admin', 'products', { type, status, review, q }],
    queryFn: () => api.listAdminProducts({ type: type || undefined, status: status || undefined, review, q: q || undefined }),
    refetchInterval: (query) => (query.state.data?.some((p) => p.summaryAdmin?.status === 'pending') ? 3000 : false),
  });
  const chip = (label: string, on: boolean, fn: () => void) => <button key={label} className="chip whitespace-nowrap" aria-pressed={on} onClick={fn}>{label}</button>;

  return (
    <div className="pb-10">
      <AdminHeader title="Products" right={<Link to="/admin/products/new" aria-label="Add product" className="btn btn-primary min-h-11 w-11 px-0"><Icon name="plus" /></Link>} />
      <div className="px-4">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input className="input pl-10" placeholder="Search products" value={q} onChange={(e) => set({ q: e.target.value })} />
        </label>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {chip('All', !type && !status && !review, () => setParams({}, { replace: true }))}
          {chip('Books', type === 'book', () => set({ type: type === 'book' ? '' : 'book' }))}
          {chip('Music', type === 'music', () => set({ type: type === 'music' ? '' : 'music' }))}
          {chip('Drafts', status === 'draft', () => set({ status: status === 'draft' ? '' : 'draft' }))}
          {chip('Needs review', review, () => set({ review: review ? '' : '1' }))}
        </div>
      </div>
      <div className="mt-4 px-4">
        {list.isError ? <ErrorState onRetry={() => list.refetch()} /> : list.isLoading ? <Skeleton className="h-24" /> : list.data!.length === 0 ? (
          <EmptyState title="No products here" message="Try a different filter, or add your first product." action={<Link to="/admin/products/new" className="btn btn-primary">Add product</Link>} />
        ) : (
          <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {list.data!.map((p) => (
              <li key={p.id}>
                <Link to={`/admin/products/${p.id}`} className="card flex gap-3 p-3">
                  <Cover product={p} className="h-[66px] w-12 rounded-md" />
                  <div className="min-w-0 flex-1 text-xs text-muted">
                    <p className="truncate text-sm font-semibold text-fg">{p.title}</p>
                    {p.creator} · {p.type === 'book' ? 'Book' : 'Music'} · {formatPrice(p.price)}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusChip tone={p.status === 'published' ? 'ok' : 'muted'}>{p.status === 'published' ? 'Published' : 'Draft'}</StatusChip>
                      <SummaryChip p={p} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
