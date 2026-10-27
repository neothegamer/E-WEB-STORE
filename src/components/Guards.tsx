import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMe } from '@/hooks/useAuth';
import { Skeleton, EmptyState } from './States';
import { Link } from 'react-router-dom';

function Loading() {
  return <div className="space-y-3 p-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-40 w-full" /></div>;
}

export function ProtectedRoute() {
  const { user, loading } = useMe();
  const loc = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useMe();
  const loc = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (user.role !== 'admin') {
    return <EmptyState title="Admins only" message="You do not have access to this area." action={<Link to="/" className="btn btn-primary">Back to the store</Link>} />;
  }
  return <Outlet />;
}
