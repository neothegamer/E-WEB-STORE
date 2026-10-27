import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { Icon } from '@/components/Icon';
import { AdminHeader, StatusChip } from '@/components/admin/ui';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';

const FILTERS = [{ v: '', l: 'All' }, { v: 'buyer', l: 'Buyers' }, { v: 'admin', l: 'Admins' }];

export default function Users() {
  const list = useQuery({ queryKey: ['admin', 'users'], queryFn: api.listAdminUsers });
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const rows = (list.data ?? []).filter((u) => (!role || u.role === role) && (!q || (u.name + u.email).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="pb-10">
      <AdminHeader title="Users" />
      <div className="px-4">
        <label className="relative block"><span className="sr-only">Search users</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input className="input pl-10" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="mt-3 flex gap-2">{FILTERS.map((f) => <button key={f.l} className="chip" aria-pressed={role === f.v} onClick={() => setRole(f.v)}>{f.l}</button>)}</div>
      </div>
      <div className="mt-4 px-4">
        {list.isError ? <ErrorState onRetry={() => list.refetch()} /> : list.isLoading ? <Skeleton className="h-40" /> : rows.length === 0 ? <EmptyState title="No users found" /> : (
          <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {rows.map((u) => (
              <li key={u.id} className="card flex items-center gap-3 p-3">
                <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface2 font-bold text-accent">{u.name[0]}</span>
                <div className="min-w-0 flex-1 text-xs text-muted"><p className="truncate text-sm font-semibold text-fg">{u.name}</p><p className="truncate">{u.email}</p></div>
                <div className="text-right text-xs text-muted"><StatusChip tone={u.role === 'admin' ? 'warn' : 'muted'}>{u.role === 'admin' ? 'Admin' : 'Buyer'}</StatusChip><p className="mt-1">{u.itemsCount} {u.itemsCount === 1 ? 'item' : 'items'}</p></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
