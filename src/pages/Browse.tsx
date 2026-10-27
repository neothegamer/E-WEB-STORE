import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import type { ProductQuery, ProductType } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { ProductGrid } from '@/components/ProductCard';
import { EmptyState, ErrorState, GridSkeleton } from '@/components/States';

const TYPES: { value: ProductType | ''; label: string }[] = [
  { value: '', label: 'All' }, { value: 'book', label: 'Books' }, { value: 'music', label: 'Music' },
];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const type = (params.get('type') || '') as ProductType | '';
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const sort = (params.get('sort') || 'newest') as NonNullable<ProductQuery['sort']>;

  // All filter state lives in the URL so back, forward and sharing work
  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };

  const cats = useQuery({ queryKey: ['categories'], queryFn: api.listCategories, staleTime: 10 * 60_000 });
  const list = useInfiniteQuery({
    queryKey: ['products', { type, category, q, sort }],
    queryFn: ({ pageParam }) => api.listProducts({ type: type || undefined, category: category || undefined, q: q || undefined, sort, page: pageParam, limit: 8 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
  });

  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;
  const visibleCats = (cats.data ?? []).filter((c) => !type || c.type === type);

  return (
    <div>
      <PageHeader title="Browse" />
      <div className="px-4">
        {q && (
          <p className="mb-3 text-sm text-muted">
            Results for “{q}” <button onClick={() => update({ q: '' })} className="ml-1 font-bold text-accent">Clear</button>
          </p>
        )}
        <div className="flex gap-2" role="group" aria-label="Type">
          {TYPES.map((t) => <button key={t.label} className="chip" aria-pressed={type === t.value} onClick={() => update({ type: t.value, category: '' })}>{t.label}</button>)}
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Category">
          {visibleCats.map((c) => (
            <button key={c.id} className="chip whitespace-nowrap" aria-pressed={category === c.slug} onClick={() => update({ category: category === c.slug ? '' : c.slug })}>{c.name}</button>
          ))}
        </div>
        <div className="my-4 flex items-center justify-between text-xs text-muted">
          <span aria-live="polite">{list.isLoading ? 'Loading...' : `${total} results`}</span>
          <label className="flex items-center gap-1">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="rounded-btn bg-transparent py-2 font-semibold text-fg">
              <option value="newest">Newest</option>
              <option value="price_asc">Price, low to high</option>
              <option value="price_desc">Price, high to low</option>
            </select>
          </label>
        </div>

        {list.isError ? <ErrorState onRetry={() => list.refetch()} /> : list.isLoading ? <GridSkeleton count={6} /> : items.length === 0 ? (
          <EmptyState title="Nothing matches yet" message="Try removing a filter or searching for something else."
            action={<button className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>Clear filters</button>} />
        ) : (
          <>
            <ProductGrid items={items} />
            {list.hasNextPage && (
              <button className="btn btn-ghost mt-6 w-full" disabled={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
                {list.isFetchingNextPage ? 'Loading...' : 'Show more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
