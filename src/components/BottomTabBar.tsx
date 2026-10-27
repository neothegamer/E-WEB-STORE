import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { Icon, type IconName } from './Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/browse', label: 'Browse', icon: 'search' },
  { to: '/library', label: 'Library', icon: 'library' },
  { to: '/cart', label: 'Cart', icon: 'cart' },
  { to: '/account', label: 'Account', icon: 'user' },
];

export function BottomTabBar() {
  const count = useCart((s) => s.items.length);
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="flex h-[72px] items-center justify-around">
        {TABS.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                cn('relative flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 text-[11px]', isActive ? 'font-semibold text-accent' : 'text-muted')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span layoutId="tab-pill" className="absolute -top-3.5 h-[3px] w-8 rounded-pill bg-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }} />
                  )}
                  <Icon name={t.icon} />
                  <span>{t.label}</span>
                  {t.to === '/cart' && count > 0 && (
                    <span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
                      {count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
