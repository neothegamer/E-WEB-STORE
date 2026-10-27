import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type Tone = 'ok' | 'warn' | 'bad' | 'muted';
const TONES: Record<Tone, string> = {
  ok: 'bg-ok/15 text-ok', warn: 'bg-warn/15 text-warn', bad: 'bg-bad/15 text-bad', muted: 'bg-surface2 text-muted',
};

export function StatusChip({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn('inline-block rounded-pill px-2.5 py-1 text-[11px] font-semibold', TONES[tone])}>{children}</span>;
}

export function AdminHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-4">
      <h1 className="h2 flex-1">{title}</h1>
      {right}
    </div>
  );
}

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={cn('relative h-[30px] w-[52px] shrink-0 rounded-pill border border-border transition-colors', checked ? 'bg-accent' : 'bg-surface2', disabled && 'opacity-50')}>
      <span className={cn('absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all', checked ? 'left-[27px]' : 'left-[3px]')} />
    </button>
  );
}

/** Bottom sheet on phones, centred dialog on desktop. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 lg:items-center" onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[24px] bg-bg p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:rounded-none lg:rounded-card"
            initial={{ y: 48 }} animate={{ y: 0 }} exit={{ y: 48 }} transition={{ duration: 0.22 }}>
            <h2 className="h2 mb-4">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onClose }: {
  open: boolean; title: string; message: string; confirmLabel: string; busy?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <p className="mb-5 text-sm text-muted">{message}</p>
      <div className="flex gap-2">
        <button className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
        <button className="btn flex-1 bg-bad text-white" disabled={busy} onClick={onConfirm}>{busy ? 'Please wait...' : confirmLabel}</button>
      </div>
    </Sheet>
  );
}

export function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  const id = useId();
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="input">{children}</select>
    </div>
  );
}

/** File picker with a progress bar. onUpload does the real work and reports progress 0 to 100. */
export function FileField({ label, accept, hint, current, onUpload, disabled }: {
  label: string; accept: string; hint: string; current?: string; disabled?: boolean;
  onUpload: (file: File, onProgress: (pct: number) => void) => Promise<void>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [error, setError] = useState('');
  const pick = async (file?: File) => {
    if (!file) return;
    setError(''); setPct(0);
    try { await onUpload(file, setPct); }
    catch (e) { setError(e instanceof Error ? e.message : 'Upload failed. Try again.'); }
    finally { setPct(null); if (ref.current) ref.current.value = ''; }
  };
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>
      <div className="card flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{current ?? 'No file yet'}</p>
          <p className="text-xs text-muted">{hint}</p>
          {pct !== null && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-surface2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
        <input ref={ref} type="file" accept={accept} className="sr-only" id={`f-${label}`} disabled={disabled || pct !== null} onChange={(e) => pick(e.target.files?.[0])} />
        <label htmlFor={`f-${label}`} className={cn('btn btn-ghost min-h-11 cursor-pointer px-4', (disabled || pct !== null) && 'pointer-events-none opacity-50')}>
          {pct !== null ? `${pct}%` : current ? 'Replace' : 'Choose'}
        </label>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-bad">{error}</p>}
    </div>
  );
}
