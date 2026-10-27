import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-card bg-surface2', className)} />;
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card p-2">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="mt-2 h-3.5 w-3/4" />
          <Skeleton className="mt-1.5 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong while loading this.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card mx-4 p-6 text-center">
      <p className="text-sm text-muted">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn btn-primary mt-4">Try again</button>}
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="mx-4 px-4 py-14 text-center">
      <h2 className="h2">{title}</h2>
      {message && <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
