import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api';
import { useUi } from '@/store/ui';
import { AuthLayout, PasswordField, PasswordStrength } from '@/components/AuthLayout';

export default function ResetPassword() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f: typeof errors = {};
    if (password.length < 8) f.password = 'Use at least 8 characters.';
    if (confirm !== password) f.confirm = 'The passwords do not match.';
    setErrors(f);
    if (Object.keys(f).length) return;
    setBusy(true); setFormError('');
    try {
      await api.resetPassword({ token, password });
      toast('Password updated. Log in with your new password.');
      navigate('/login', { replace: true });
    } catch {
      setFormError('This link is no longer valid. Request a new one and try again.');
    } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="New password" subtitle="Choose a new password. You will be logged out of other devices.">
      <form onSubmit={submit} noValidate>
        <PasswordField label="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <PasswordStrength value={password} />
        <PasswordField label="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        {formError && (
          <p role="alert" className="mb-3 text-sm text-bad">{formError} <Link to="/forgot-password" className="font-bold underline">Send a new link</Link></p>
        )}
        <button className="btn btn-primary mt-2 w-full" disabled={busy}>{busy ? 'Updating...' : 'Update password'}</button>
      </form>
    </AuthLayout>
  );
}
