import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayer } from '@/store/player';
import { formatTime, PREVIEW_SECONDS } from '@/lib/utils';
import { Cover } from './Cover';
import { Icon } from './Icon';

/**
 * Global 30-second preview player. Plays previewUrl when the product has one,
 * otherwise simulates the preview with a timer (mock mode).
 */
export function MiniPlayer({ bottom }: { bottom: number }) {
  const { current, playing, position, ended, toggle, stop, tick, finish } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!current?.previewUrl) { audioRef.current = null; return; }
    const a = new Audio(current.previewUrl);
    audioRef.current = a;
    a.ontimeupdate = () => (a.currentTime >= PREVIEW_SECONDS ? finish() : tick(a.currentTime));
    a.onended = () => finish();
    return () => { a.pause(); audioRef.current = null; };
  }, [current?.id, current?.previewUrl, tick, finish]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      if (playing) a.play().catch(() => finish());
      else a.pause();
      return;
    }
    if (!current || !playing) return;
    const t = setInterval(() => {
      const next = usePlayer.getState().position + 0.25;
      if (next >= PREVIEW_SECONDS) finish();
      else tick(next);
    }, 250);
    return () => clearInterval(t);
  }, [current?.id, playing, tick, finish]);

  const style = { '--pb': `${bottom}px` } as CSSProperties;
  return (
    <AnimatePresence>
      {current && (
        <motion.div
          role="region" aria-label="Preview player" style={style}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          className="fixed inset-x-3 bottom-[calc(var(--pb)+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl overflow-hidden rounded-card bg-[#1a1816] text-white shadow-xl dark:bg-surface dark:ring-1 dark:ring-accent/40 lg:bottom-4"
        >
          <div className="flex items-center gap-3 p-2 pr-1">
            <Link to={`/product/${current.slug}`}><Cover product={current} className="h-10 w-10 rounded-md" /></Link>
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="truncate text-[13px] font-semibold">{current.title}</p>
              <p className="truncate text-[11px] text-white/70">
                {ended ? 'Preview finished' : `Preview ${formatTime(position)} / ${formatTime(PREVIEW_SECONDS)}`}
              </p>
            </div>
            {ended && <Link to={`/product/${current.slug}`} className="rounded-btn bg-accent px-3 py-2 text-xs font-bold text-accent-fg">Buy</Link>}
            <button aria-label={playing ? 'Pause preview' : ended ? 'Replay preview' : 'Play preview'} onClick={toggle}
              className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-fg">
              <Icon name={playing ? 'pause' : 'play'} className="h-4 w-4" />
            </button>
            <button aria-label="Close player" onClick={stop} className="grid h-11 w-9 place-items-center text-white/70"><Icon name="x" className="h-4 w-4" /></button>
          </div>
          <div className="h-[3px] bg-white/15"><div className="h-full bg-accent" style={{ width: `${Math.min(100, (position / PREVIEW_SECONDS) * 100)}%` }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
