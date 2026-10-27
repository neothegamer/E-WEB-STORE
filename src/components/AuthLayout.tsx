import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { HeroStage } from '@/three/Stage';
import { CoverCollage } from './CoverCollage';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

/** Sign-in pages: a compact 3D hero on top (same scene as Home), form sheet below. */
export function AuthLayout({ title, subtitle, children, footer, mail }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode; mail?: boolean }) {
  const featured = useQuery({ queryKey: ['featured'], queryFn: api.getFeatured });
  const products = featured.data ?? [];
  const chip = 'pointer-events-none absolute z-10 rounded-pill border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur';
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <HeroStage products={products} compact mail={mail} pauseOnTyping fallback={<CoverCollage compact products={products} />}
        className="relative h-56 shrink-0 overflow-hidden text-white">
        <Link to="/" className="h2 absolute left-6 top-5 z-10">[BRAND]</Link>
        <Link to="/" aria-label="Close" className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center"><Icon name="x" /></Link>
        {!mail && <span className={`${chip} left-5 top-[118px]`}>30s preview</span>}
        {!mail && <span className={`${chip} right-6 top-[150px]`}>AI summary</span>}
        <h1 className="h1 pointer-events-none absolute bottom-10 left-6 z-10 max-w-xs">{title}</h1>
      </HeroStage>
      <div className="relative -mt-7 flex-1 rounded-t-[28px] border-accent bg-bg px-6 pb-10 pt-6 dark:rounded-none dark:border-t-[3px]">
        <p className="mb-5 text-sm leading-relaxed text-muted">{subtitle}</p>
        {children}
        {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string }

export function Field({ label, error, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn('input', className)} {...props} />
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-bad">{error}</p>}
    </div>
  );
}

export function PasswordField({ label, error, ...props }: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="input pr-16" {...props} />
        <button type="button" onClick={() => setShow(!show)} aria-pressed={show} className="absolute right-1 top-1/2 h-11 -translate-y-1/2 px-3 text-xs font-bold text-muted">
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-bad">{error}</p>}
    </div>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  const score = Math.min(4, (value.length >= 8 ? 1 : 0) + (value.length >= 12 ? 1 : 0) + (/\d/.test(value) ? 1 : 0) + (/[A-Z\W]/.test(value) ? 1 : 0));
  if (!value) return null;
  const label = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'][score];
  return (
    <div className="-mt-2 mb-4" aria-live="polite">
      <div className="mb-1 flex gap-1.5">{[1, 2, 3, 4].map((n) => <i key={n} className={cn('h-1 flex-1 rounded-pill', n <= score ? 'bg-ok' : 'bg-border')} />)}</div>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
