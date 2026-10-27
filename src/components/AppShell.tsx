import { useEffect } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/store/player';
import { BottomTabBar } from './BottomTabBar';
import { TopBar } from './TopBar';
import { MiniPlayer } from './MiniPlayer';
import { SearchOverlay } from './SearchOverlay';
import { Toaster } from './Toaster';
import { OfflineBanner } from './OfflineBanner';
import { DevPanel } from './DevPanel';

// Pages that use their own bottom bar or a focused layout hide the tab bar
const HIDE_TABS = [/^\/product\//, /^\/login/, /^\/register/, /^\/forgot-password/, /^\/reset-password/, /^\/checkout/, /^\/admin/];

export function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  const hasPlayer = usePlayer((s) => !!s.current);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const hideTabs = HIDE_TABS.some((r) => r.test(location.pathname));
  const isProduct = location.pathname.startsWith('/product/');
  const playerBottom = !hideTabs ? 84 : isProduct ? 96 : 12;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <OfflineBanner />
      <TopBar />
      <main className={cn('mx-auto w-full max-w-6xl', hideTabs ? (isProduct ? 'pb-28' : 'pb-8') : 'pb-28 lg:pb-10', hasPlayer && 'pb-44')}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="hidden border-t border-border py-6 text-sm text-muted lg:block">
        <div className="mx-auto flex max-w-6xl gap-6 px-4">
          <Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/refunds">Refunds</Link>
        </div>
      </footer>
      {!hideTabs && <BottomTabBar />}
      <MiniPlayer bottom={playerBottom} />
      <SearchOverlay />
      <Toaster />
      <DevPanel />
    </div>
  );
}
