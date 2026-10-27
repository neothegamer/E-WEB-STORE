import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useLogout, useMe } from '@/hooks/useAuth';
import { useUi } from '@/store/ui';
import { useTheme, type ThemeMode } from '@/store/theme';
import { AdminHeader, Switch } from '@/components/admin/ui';
import { ErrorState } from '@/components/States';

const MODES: { value: ThemeMode; label: string }[] = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }];

export default function Settings() {
  const qc = useQueryClient();
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const { user } = useMe();
  const logout = useLogout();
  const { mode, setMode } = useTheme();
  const q = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  const update = useMutation({
    mutationFn: (v: boolean) => api.updateSettings({ autoPublishSummaries: v }),
    onSuccess: (s) => { qc.setQueryData(['settings'], s); toast(s.autoPublishSummaries ? 'New summaries will publish automatically' : 'New summaries will wait for your approval'); },
    onError: (e) => toast(e instanceof Error ? e.message : 'Could not save.', 'error'),
  });

  return (
    <div className="space-y-4 pb-10">
      <AdminHeader title="Settings" />
      {q.isError ? <ErrorState onRetry={() => q.refetch()} /> : (
        <section className="card mx-4 p-4">
          <h2 className="mb-2 text-[15px] font-bold">Preview summaries</h2>
          <div className="flex items-start gap-3">
            <div className="flex-1"><p className="text-sm font-semibold">Auto-publish AI summaries</p>
              <p className="mt-0.5 text-xs text-muted">When off, every summary waits for your approval before customers can see it.</p></div>
            <Switch label="Auto-publish AI summaries" checked={q.data?.autoPublishSummaries ?? false} disabled={q.isLoading || update.isPending} onChange={(v) => update.mutate(v)} />
          </div>
        </section>
      )}
      <section className="card mx-4 p-4">
        <h2 className="mb-3 text-[15px] font-bold">Appearance</h2>
        <div className="flex gap-2" role="group" aria-label="Theme">{MODES.map((m) => <button key={m.value} className="chip flex-1 justify-center" aria-pressed={mode === m.value} onClick={() => setMode(m.value)}>{m.label}</button>)}</div>
      </section>
      <section className="card mx-4 p-4">
        <h2 className="mb-1 text-[15px] font-bold">Account</h2>
        <p className="mb-3 text-sm text-muted">{user?.email}</p>
        <button className="btn btn-ghost w-full" onClick={async () => { await logout(); navigate('/'); }}>Log out</button>
      </section>
    </div>
  );
}
