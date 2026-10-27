import { Link, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '@/hooks/useAuth';
import { useTheme, type ThemeMode } from '@/store/theme';
import { PageHeader } from '@/components/PageHeader';

const MODES: { value: ThemeMode; label: string }[] = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }];

export default function Account() {
  const { user } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const { mode, setMode } = useTheme();
  const row = 'flex min-h-12 items-center justify-between border-b border-border py-3 text-sm font-semibold last:border-0';

  return (
    <div>
      <PageHeader title="Account" />
      <div className="space-y-4 px-4">
        {user ? (
          <section className="card p-4">
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
          </section>
        ) : (
          <section className="card p-4">
            <p className="text-sm text-muted">Log in to see your library and orders.</p>
            <div className="mt-3 flex gap-2"><Link to="/login" className="btn btn-primary flex-1">Log in</Link><Link to="/register" className="btn btn-ghost flex-1">Create account</Link></div>
          </section>
        )}
        <section className="card p-4">
          <h2 className="mb-3 text-[15px] font-bold">Appearance</h2>
          <div className="flex gap-2" role="group" aria-label="Theme">
            {MODES.map((m) => <button key={m.value} className="chip flex-1 justify-center" aria-pressed={mode === m.value} onClick={() => setMode(m.value)}>{m.label}</button>)}
          </div>
        </section>
        <section className="card px-4">
          {user && <Link to="/orders" className={row}>Orders</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={row}>Admin area</Link>}
          <Link to="/terms" className={row}>Terms</Link>
          <Link to="/privacy" className={row}>Privacy</Link>
          <Link to="/refunds" className={row}>Refunds</Link>
        </section>
        {user && <button className="btn btn-ghost w-full" onClick={async () => { await logout(); navigate('/'); }}>Log out</button>}
      </div>
    </div>
  );
}
