import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { usePlayer } from '@/store/player';
import { useUi } from '@/store/ui';
import type { LibraryItem, ProductType } from '@/types';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';

const TABS: { value: ProductType | ''; label: string }[] = [{ value: '', label: 'All' }, { value: 'book', label: 'Books' }, { value: 'music', label: 'Music' }];

function Row({ item }: { item: LibraryItem }) {
  const { product: p } = item;
  const toast = useUi((s) => s.toast);
  const play = usePlayer((s) => s.play);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const { url } = await api.getDownloadUrl(p.id);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'The download link expired. Try again.', 'error');
    } finally { setBusy(false); }
  };

  return (
    <li className="card flex gap-3 p-3">
      <Cover product={p} className="h-[78px] w-14 rounded-md" />
      <div className="min-w-0 flex-1 text-xs text-muted">
        <p className="truncate text-sm font-semibold text-fg">{p.title}</p>
        {p.creator} · {p.type === 'book' ? 'Book' : 'Music'}
        <p>Bought {new Date(item.acquiredAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
        <div className="mt-2 flex gap-2">
          {p.type === 'music'
            ? <button className="btn btn-primary min-h-11 flex-1" onClick={() => play(p)}><Icon name="play" className="h-4 w-4" /> Play</button>
            : <Link className="btn btn-primary min-h-11 flex-1" to={`/product/${p.slug}`}><Icon name="library" className="h-4 w-4" /> Read</Link>}
          <button aria-label={`Download ${p.title}`} className="btn btn-ghost min-h-11 w-11 px-0" onClick={download} disabled={busy}><Icon name="download" /></button>
        </div>
      </div>
    </li>
  );
}

export default function Library() {
  const [tab, setTab] = useState<ProductType | ''>('');
  const q = useQuery({ queryKey: ['library'], queryFn: api.listLibrary });
  const items = (q.data ?? []).filter((i) => !tab || i.product.type === tab);

  return (
    <div>
      <PageHeader title="My library" />
      <div className="flex gap-2 px-4 pb-3" role="group" aria-label="Filter library">
        {TABS.map((t) => <button key={t.label} className="chip" aria-pressed={tab === t.value} onClick={() => setTab(t.value)}>{t.label}</button>)}
      </div>
      {q.isLoading ? <div className="space-y-3 px-4"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        : q.isError ? <ErrorState onRetry={() => q.refetch()} />
        : items.length === 0 ? <EmptyState title="Your library is empty" message="Everything you buy shows up here, ready to read, play, or download." action={<Link to="/browse" className="btn btn-primary">Browse the store</Link>} />
        : <ul className="space-y-3 px-4 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">{items.map((i) => <Row key={i.product.id} item={i} />)}</ul>}
    </div>
  );
}
