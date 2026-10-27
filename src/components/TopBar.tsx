import { Link, NavLink } from 'react-router-dom';
import { useCart } from '@/store/cart';
import { useUi } from '@/store/ui';
import { useMe } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';

/** Desktop navigation. On phones the bottom tab bar is used instead. */
export function TopBar() {
  const count = useCart((s) => s.items.length);
  const openSearch = useUi((s) => s.openSearch);
  const { user } = useMe();
  const link = ({ isActive }: { isActive: boolean }) => cn('px-3 py-2 text-sm font-semibold', isActive ? 'text-accent' : 'text-muted hover:text-fg');
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-bg/90 backdrop-blur lg:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <Link to="/" className="h2 mr-6">[BRAND]</Link>
        <NavLink to="/" end className={link}>Home</NavLink>
        <NavLink to="/browse" className={link}>Browse</NavLink>
        <NavLink to="/library" className={link}>Library</NavLink>
        <div className="flex-1" />
        <button aria-label="Search" onClick={openSearch} className="grid h-11 w-11 place-items-center"><Icon name="search" /></button>
        <ThemeToggle />
        <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative grid h-11 w-11 place-items-center">
          <Icon name="cart" />
          {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">{count}</span>}
        </Link>
        {user ? (
          <Link to="/account" className="btn btn-ghost min-h-10">{user.name.split(' ')[0]}</Link>
        ) : (
          <Link to="/login" className="btn btn-primary min-h-10">Log in</Link>
        )}
      </div>
    </header>
  );
}
