import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter';
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must include a number';
  return null;
}

export function Signup() {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) { setError('Please enter your full name'); return; }
    const pwError = validatePassword(password);
    if (pwError) { setError(pwError); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      setLoading(false);
      setError(error);
      toast(error, 'error');
      return;
    }
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      toast('Account created. Please log in.', 'info');
      navigate('/login');
      return;
    }
    toast('Account created. Welcome to SalesPilot AI!');
    navigate('/dashboard');
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start analyzing conversations and closing more deals."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-amber-600 hover:text-amber-700">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="fullName" label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jordan Smith" required />
        <Input id="email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
        <Input id="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        <Input id="confirm" type="password" label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
        <p className="text-xs text-slate-400">Min 8 characters, one uppercase, one lowercase, one number.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>Create account</Button>
      </form>
      {!isSupabaseConfigured && (
        <p className="mt-4 text-center text-xs text-slate-400">Supabase isn't configured — use Demo Mode on the login page to explore.</p>
      )}
    </AuthLayout>
  );
}
