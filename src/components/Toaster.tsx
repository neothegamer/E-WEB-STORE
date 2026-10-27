import { AnimatePresence, motion } from 'framer-motion';
import { useUi } from '@/store/ui';
import { cn } from '@/lib/utils';

export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 lg:left-auto lg:right-4 lg:w-80 lg:items-stretch">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn('pointer-events-auto rounded-btn px-4 py-3 text-sm font-semibold shadow-lg', t.tone === 'error' ? 'bg-bad text-white' : 'bg-fg text-bg')}>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
