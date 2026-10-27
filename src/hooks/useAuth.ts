import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

export function useMe() {
  const q = useQuery({ queryKey: ['me'], queryFn: api.me, retry: false, staleTime: 5 * 60_000 });
  return { user: q.data ?? null, loading: q.isLoading };
}

export function useLogout() {
  const qc = useQueryClient();
  return async () => {
    await api.logout();
    qc.setQueryData(['me'], null);
    qc.removeQueries({ queryKey: ['library'] });
    qc.removeQueries({ queryKey: ['orders'] });
  };
}
