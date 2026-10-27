import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/settings', label: 'Settings' },
];

/** Admin shell: horizontal chip nav on phones, sidebar on desktop. Screens follow the admin boards on the canvas. */
export default function AdminLayout() {
  return (
    <div className="lg:flex">
      <nav aria-label="Admin" className="sticky top-0 z-20 flex items-center gap-2 overflow-x-auto bg-bg/95 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur lg:h-dvh lg:w-56 lg:flex-col lg:items-stretch lg:border-r lg:border-border lg:py-6">
        <span className="h2 hidden px-3 pb-3 lg:block">Admin</span>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn('chip whitespace-nowrap lg:justify-start', isActive && 'on')}>{l.label}</NavLink>
        ))}
        <div className="ml-auto lg:ml-0 lg:mt-auto"><ThemeToggle /></div>
      </nav>
      <div className="min-w-0 flex-1"><Outlet /></div>
    </div>
  );
}
