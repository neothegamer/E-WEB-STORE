import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { USE_MOCKS } from '@/api/client';
import { useMe, useLogout } from '@/hooks/useAuth';

/** Only shown in mock mode: switch between the demo buyer and admin to preview every screen. */
export function DevPanel() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { user } = useMe();
  const logout = useLogout();
  if (!USE_MOCKS) return null;

  const loginAs = async (email: string) => {
    const u = await api.login({ email, password: 'password123' });
    qc.setQueryData(['me'], u);
    qc.invalidateQueries({ queryKey: ['library'] });
    qc.invalidateQueries({ queryKey: ['orders'] });
  };
  return (
    <div className="fixed left-2 top-20 z-[70] text-xs lg:top-20">
      <button onClick={() => setOpen(!open)} className="rounded-pill bg-fg/80 px-3 py-1.5 font-bold text-bg">Dev</button>
      {open && (
        <div className="mt-2 w-44 space-y-1 rounded-card bg-fg p-2 text-bg shadow-xl">
          <p className="px-2 py-1 opacity-70">{user ? `${user.name} (${user.role})` : 'Logged out'}</p>
          <button className="block w-full rounded px-2 py-2 text-left font-semibold hover:bg-bg/20" onClick={() => loginAs('ada@example.com')}>Log in as buyer</button>
          <button className="block w-full rounded px-2 py-2 text-left font-semibold hover:bg-bg/20" onClick={() => loginAs('admin@example.com')}>Log in as admin</button>
          <button className="block w-full rounded px-2 py-2 text-left font-semibold hover:bg-bg/20" onClick={() => logout()}>Log out</button>
        </div>
      )}
    </div>
  );
}
