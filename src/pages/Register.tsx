import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useMe } from '@/hooks/useAuth';
import { safeNext } from '@/lib/utils';
import { AuthLayout, EMAIL_RE, Field, PasswordField, PasswordStrength } from '@/components/AuthLayout';

export default function Register() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useMe();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f: typeof errors = {};
    if (name.trim().length < 2) f.name = 'Enter your name.';
    if (!EMAIL_RE.test(email)) f.email = 'Enter a valid email.';
    if (password.length < 8) f.password = 'Use at least 8 characters.';
    setErrors(f);
    if (Object.keys(f).length) return;
    setBusy(true); setFormError('');
    try {
      const u = await api.register({ name: name.trim(), email: email.trim(), password });
      qc.setQueryData(['me'], u);
      navigate(next, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create your account. Try again.');
    } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="Join [BRAND]" subtitle="Preview first, buy once, and keep it all in your library."
      footer={<>Already have an account? <Link to="/login" className="font-bold text-accent">Log in</Link></>}>
      <form onSubmit={submit} noValidate>
        <Field label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordField label="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <PasswordStrength value={password} />
        {formError && <p role="alert" className="mb-3 text-sm text-bad">{formError}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        <p className="mt-3 text-center text-xs text-muted">By creating an account you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
      </form>
    </AuthLayout>
  );
}
