import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useMe } from '@/hooks/useAuth';
import { safeNext } from '@/lib/utils';
import { AuthLayout, EMAIL_RE, Field, PasswordField } from '@/components/AuthLayout';

export default function Login() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useMe();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f: typeof errors = {};
    if (!EMAIL_RE.test(email)) f.email = 'Enter a valid email.';
    if (!password) f.password = 'Enter your password.';
    setErrors(f);
    if (Object.keys(f).length) return;
    setBusy(true); setFormError('');
    try {
      const u = await api.login({ email: email.trim(), password });
      qc.setQueryData(['me'], u);
      qc.invalidateQueries({ queryKey: ['library'] });
      navigate(next, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not log in. Try again.');
    } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your library and pick up where you left off."
      footer={<>New here? <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-bold text-accent">Create an account</Link></>}>
      <form onSubmit={submit} noValidate>
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="-mt-2 mb-3 text-right"><Link to="/forgot-password" className="inline-block py-2 text-[13px] font-semibold text-accent">Forgot password?</Link></div>
        {formError && <p role="alert" className="mb-3 text-sm text-bad">{formError}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        <Link to="/browse" className="btn btn-ghost mt-3 w-full">Continue browsing</Link>
      </form>
    </AuthLayout>
  );
}
