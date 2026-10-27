import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/api';
import { useUi } from '@/store/ui';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { Cover } from './Cover';
import { Icon } from './Icon';

const RECENT_KEY = 'recent_searches';
const getRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="bg-transparent font-bold text-accent">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

function Group({ title, items, q, onPick }: { title: string; items: Product[]; q: string; onPick: () => void }) {
  if (!items.length) return null;
  return (
    <section className="mt-4">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">{title}</h2>
      <ul>
        {items.map((p) => (
          <li key={p.id} className="border-b border-border">
            <Link to={`/product/${p.slug}`} onClick={onPick} className="flex items-center gap-3 py-2">
              <Cover product={p} className={p.type === 'book' ? 'h-14 w-10 rounded-md' : 'h-10 w-10 rounded-md'} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold"><Highlight text={p.title} q={q} /></p>
                <p className="truncate text-xs text-muted">{p.creator}</p>
              </div>
              <span className="text-[13px] font-bold text-accent">{formatPrice(p.price, p.currency)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUi();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { if (searchOpen) { setRecent(getRecent()); setText(''); setQ(''); } }, [searchOpen]);
  useEffect(() => { const t = setTimeout(() => setQ(text.trim()), 250); return () => clearTimeout(t); }, [text]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSearch();
    if (searchOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, closeSearch]);

  const results = useQuery({ queryKey: ['suggest', q], queryFn: () => api.listProducts({ q, limit: 6 }), enabled: searchOpen && q.length >= 2 });

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    localStorage.setItem(RECENT_KEY, JSON.stringify([t, ...getRecent().filter((r) => r !== t)].slice(0, 5)));
    closeSearch();
    navigate(`/browse?q=${encodeURIComponent(t)}`);
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); go(text); };

  const items = results.data?.items ?? [];
  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-50 overflow-y-auto bg-bg px-4 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.2 }}>
          <div className="mx-auto max-w-2xl">
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Search books and music</span>
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Search books and music" className="input pl-10" enterKeyHint="search" />
              </label>
              <button type="button" onClick={closeSearch} className="min-h-11 px-2 text-sm font-bold text-accent">Cancel</button>
            </form>

            {q.length < 2 && recent.length > 0 && (
              <section className="mt-5">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Recent</h2>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => <button key={r} onClick={() => go(r)} className="chip">{r}</button>)}
                </div>
              </section>
            )}
            {q.length >= 2 && results.isLoading && <p className="mt-6 text-sm text-muted">Searching...</p>}
            {q.length >= 2 && !results.isLoading && items.length === 0 && (
              <p className="mt-6 text-sm text-muted">No results for “{q}”. Try a title or an artist name.</p>
            )}
            <Group title="Books" items={items.filter((p) => p.type === 'book')} q={q} onPick={closeSearch} />
            <Group title="Music" items={items.filter((p) => p.type === 'music')} q={q} onPick={closeSearch} />
            {items.length > 0 && (
              <button onClick={() => go(q)} className="btn btn-ghost mt-5 w-full">See all {results.data?.total} results for {q}</button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
