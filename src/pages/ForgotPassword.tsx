import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api';
import { AuthLayout, EMAIL_RE, Field } from '@/components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email.');
    setError(''); setBusy(true);
    try { await api.forgotPassword(email.trim()); setSent(true); setWait(45); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not send the link. Try again.'); }
    finally { setBusy(false); }
  };

  if (sent) {
    return (
      <AuthLayout mail title="Check your email" subtitle={`We sent a reset link to ${email}. It expires in 30 minutes.`}>
        <Link to="/login" className="btn btn-primary w-full">Back to log in</Link>
        <button onClick={() => send()} disabled={wait > 0 || busy} className="btn btn-ghost mt-3 w-full">
          {wait > 0 ? `Resend link in 0:${String(wait).padStart(2, '0')}` : 'Resend link'}
        </button>
        <p className="mt-4 text-center text-xs text-muted">Did not get it? Check your spam folder.</p>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout title="Forgot password?" subtitle="Enter the email you signed up with and we will send you a link to reset your password."
      footer={<Link to="/login" className="font-bold text-accent">Back to log in</Link>}>
      <form onSubmit={send} noValidate>
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <button className="btn btn-primary mt-2 w-full" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
      </form>
    </AuthLayout>
  );
}
