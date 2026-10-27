import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useUi } from '@/store/ui';
import { formatPrice } from '@/lib/utils';
import { Icon } from '@/components/Icon';
import { AdminHeader, SelectField, Sheet, StatusChip } from '@/components/admin/ui';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';

const FILTERS = ['all', 'paid', 'pending', 'failed'] as const;
const tone = (s: string) => (s === 'paid' ? 'ok' : s === 'pending' ? 'warn' : s === 'failed' ? 'bad' : 'muted') as 'ok' | 'warn' | 'bad' | 'muted';

export default function Orders() {
  const qc = useQueryClient();
  const toast = useUi((s) => s.toast);
  const list = useQuery({ queryKey: ['admin', 'orders'], queryFn: api.listAdminOrders });
  const users = useQuery({ queryKey: ['admin', 'users'], queryFn: api.listAdminUsers });
  const prods = useQuery({ queryKey: ['admin', 'products', 'published'], queryFn: () => api.listAdminProducts({ status: 'published' }) });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [grant, setGrant] = useState(false);
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');

  const grantItem = useMutation({
    mutationFn: () => api.grantItem(userId, productId),
    onSuccess: () => { toast('Item added to the user\'s library'); setGrant(false); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e) => toast(e instanceof Error ? e.message : 'Could not add the item.', 'error'),
  });

  const all = list.data ?? [];
  const count = (f: string) => (f === 'all' ? all.length : all.filter((o) => o.status === f).length);
  const rows = all.filter((o) => (filter === 'all' || o.status === filter) && (!q || (o.reference + o.userEmail).toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="pb-10">
      <AdminHeader title="Orders" right={<button aria-label="Grant item to a user" className="btn btn-primary min-h-11 w-11 px-0" onClick={() => { setUserId(users.data?.find((u) => u.role === 'buyer')?.id ?? ''); setProductId(prods.data?.[0]?.id ?? ''); setGrant(true); }}><Icon name="plus" /></button>} />
      <div className="px-4">
        <label className="relative block"><span className="sr-only">Search orders</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input className="input pl-10" placeholder="Search by reference or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => <button key={f} className="chip whitespace-nowrap capitalize" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f} {count(f)}</button>)}
        </div>
      </div>
      <div className="mt-4 px-4">
        {list.isError ? <ErrorState onRetry={() => list.refetch()} /> : list.isLoading ? <Skeleton className="h-28" /> : rows.length === 0 ? <EmptyState title="No orders" message="Nothing matches this filter." /> : (
          <ul className="space-y-3">
            {rows.map((o) => (
              <li key={o.id} className="card">
                <button className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={openId === o.id} onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                  <div className="min-w-0 flex-1 text-xs text-muted">
                    <p className="text-sm font-bold text-fg">{o.reference}</p>{o.userEmail}
                    <p>{new Date(o.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {o.items.length} {o.items.length === 1 ? 'item' : 'items'}</p>
                  </div>
                  <div className="text-right"><p className="text-sm font-bold">{formatPrice(o.total)}</p><StatusChip tone={tone(o.status)}>{o.status}</StatusChip></div>
                </button>
                {openId === o.id && (
                  <ul className="space-y-1 border-t border-border px-4 py-3 text-sm">
                    {o.items.map((i) => <li key={i.productId} className="flex justify-between"><span>{i.title}</span><span className="text-muted">{formatPrice(i.price)}</span></li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Sheet open={grant} onClose={() => setGrant(false)} title="Grant item to user">
        <p className="mb-4 text-sm text-muted">Adds the item to their library without a payment. Use it for refunds, gifts, and testing.</p>
        <SelectField label="User" value={userId} onChange={setUserId}>{users.data?.filter((u) => u.role === 'buyer').map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</SelectField>
        <SelectField label="Item" value={productId} onChange={setProductId}>{prods.data?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</SelectField>
        <button className="btn btn-primary w-full" disabled={!userId || !productId || grantItem.isPending} onClick={() => grantItem.mutate()}>{grantItem.isPending ? 'Adding...' : 'Add to library'}</button>
      </Sheet>
    </div>
  );
}
