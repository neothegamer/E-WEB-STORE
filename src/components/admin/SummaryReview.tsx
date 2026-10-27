import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useUi } from '@/store/ui';
import { cn } from '@/lib/utils';
import type { AdminProduct } from '@/types';
import { Icon } from '@/components/Icon';
import { StatusChip } from './ui';

const STEPS = ['Uploaded', 'Extracting text', 'Writing summary', 'Ready for review'];
const MIN = 300, MAX = 500;
const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

/** Where each state sits on the stepper: [steps done, active step, failed step] */
function progress(status: string): { done: number; active: number; failed: number } {
  if (status === 'pending') return { done: 2, active: 2, failed: -1 };
  if (status === 'failed') return { done: 2, active: -1, failed: 2 };
  if (status === 'ready') return { done: 3, active: 3, failed: -1 };
  return { done: 4, active: -1, failed: -1 }; // published
}

function Stepper({ status }: { status: string }) {
  const { done, active, failed } = progress(status);
  return (
    <ol className="relative mb-5 flex" aria-label="Summary progress">
      <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-3 h-0.5 bg-border" />
      {STEPS.map((label, i) => {
        const isDone = i < done, isActive = i === active, isFailed = i === failed;
        return (
          <li key={label} className={cn('relative flex-1 text-center text-[10px]', isActive || isFailed ? 'font-semibold text-fg' : 'text-muted')} aria-current={isActive ? 'step' : undefined}>
            <span className={cn('mx-auto mb-1.5 grid h-[26px] w-[26px] place-items-center rounded-full text-xs font-bold text-accent-fg',
              isFailed ? 'bg-bad' : isDone ? 'bg-ok' : isActive ? 'bg-accent' : 'bg-surface2 text-muted')}>
              {isFailed ? <Icon name="x" className="h-3.5 w-3.5" /> : isDone ? <Icon name="check" className="h-3.5 w-3.5" /> : isActive && status === 'pending' ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-fg/40 border-t-accent-fg" /> : i + 1}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

export function SummaryReview({ product }: { product: AdminProduct }) {
  const s = product.summaryAdmin;
  const qc = useQueryClient();
  const toast = useUi((u) => u.toast);
  const [text, setText] = useState(s?.text ?? '');
  const [dirty, setDirty] = useState(false);
  const [manual, setManual] = useState(false);

  // Follow the server unless the admin is mid-edit
  useEffect(() => { if (!dirty) setText(s?.text ?? ''); }, [s?.text, s?.status, dirty]);

  const done = (p: AdminProduct, msg?: string) => {
    qc.setQueryData(['admin', 'product', product.id], p);
    qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    setDirty(false); setManual(false);
    if (msg) toast(msg);
  };
  const fail = (e: unknown) => toast(e instanceof Error ? e.message : 'Something went wrong. Try again.', 'error');

  const save = useMutation({ mutationFn: () => api.updateSummary(product.id, text), onSuccess: (p) => done(p, 'Summary saved'), onError: fail });
  const regenerate = useMutation({ mutationFn: () => api.regenerateSummary(product.id), onSuccess: (p) => done(p, 'Writing a new summary...'), onError: fail });
  const approve = useMutation({
    mutationFn: async () => { if (dirty) await api.updateSummary(product.id, text); return api.approveSummary(product.id); },
    onSuccess: (p) => done(p, 'Summary approved. You can publish the book now.'), onError: fail,
  });
  const busy = save.isPending || regenerate.isPending || approve.isPending;

  if (!s) return null;
  const n = words(text);
  const inRange = n >= MIN && n <= MAX;
  const status = s.status;
  const editable = status === 'ready' || status === 'published' || manual;

  return (
    <section className="card mx-4 mb-4 p-4" aria-label="Book summary review">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Preview summary</h2>
        <StatusChip tone={status === 'published' ? 'ok' : status === 'failed' ? 'bad' : 'warn'}>
          {status === 'pending' ? 'Generating' : status === 'ready' ? 'Ready for review' : status === 'published' ? 'Published' : 'Failed'}
        </StatusChip>
      </div>
      <Stepper status={manual ? 'ready' : status} />

      {status === 'pending' && <p className="rounded-btn bg-surface2 p-3 text-sm text-muted" aria-live="polite">Reading your book and writing the summary. This usually takes about a minute.</p>}

      {status === 'failed' && !manual && (
        <div role="alert">
          <p className="mb-4 rounded-btn bg-bad/10 p-3 text-sm text-bad">{s.error ?? 'The summary could not be written.'}</p>
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1" disabled={busy} onClick={() => regenerate.mutate()}>Retry</button>
            <button className="btn btn-ghost flex-1" onClick={() => { setManual(true); setText(''); setDirty(true); }}>Write it myself</button>
          </div>
        </div>
      )}

      {editable && (
        <>
          <label className="sr-only" htmlFor="summary-text">Summary text</label>
          <textarea id="summary-text" value={text} rows={9} onChange={(e) => { setText(e.target.value); setDirty(true); }}
            className="input h-auto w-full resize-y py-3 text-[15px] leading-relaxed" />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span className={cn(inRange ? 'font-semibold text-ok' : 'text-warn')}>{n} words · target {MIN} to {MAX}</span>
            <span>{s.edited || dirty ? 'Edited by you' : 'Not edited yet'}</span>
          </div>

          <div className="mt-4 space-y-2">
            {status === 'ready' && !manual && (
              <button className="btn btn-primary w-full" disabled={busy || n < 20} onClick={() => approve.mutate()}>
                {approve.isPending ? 'Approving...' : 'Approve and publish summary'}
              </button>
            )}
            {manual && <button className="btn btn-primary w-full" disabled={busy || n < 20} onClick={() => save.mutate()}>Save summary</button>}
            {!manual && (
              <div className="flex gap-2">
                <button className="btn btn-ghost flex-1" disabled={busy} onClick={() => regenerate.mutate()}>Regenerate</button>
                <button className="btn btn-ghost flex-1" disabled={busy || !dirty || n < 20} onClick={() => save.mutate()}>Save edits</button>
              </div>
            )}
          </div>
        </>
      )}
      {status !== 'published' && <p className="mt-4 rounded-btn bg-warn/10 p-3 text-xs text-warn">This book cannot go live in the store until its summary is approved.</p>}
    </section>
  );
}
