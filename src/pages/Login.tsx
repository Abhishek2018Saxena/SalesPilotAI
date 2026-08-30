import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';

const DEMO_EMAIL = 'demo@salespilot.ai';
const DEMO_PASSWORD = 'Demo@12345';

export function Login() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      toast(error, 'error');
      return;
    }
    toast('Welcome back!');
    navigate(from, { replace: true });
  }

  function handleDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Log in to your SalesPilot workspace."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-amber-600 hover:text-amber-700">Sign up</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
        <Input id="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>Log in</Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">Demo Mode</p>
        <p className="mt-1 text-xs text-amber-700">Explore the full app with realistic demo data. No account needed.</p>
        <div className="mt-3 space-y-1 text-xs text-amber-700">
          <p>Email: {DEMO_EMAIL}</p>
          <p>Password: {DEMO_PASSWORD}</p>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full border-amber-300" onClick={handleDemo}>Fill demo credentials</Button>
      </div>

      {!isSupabaseConfigured && (
        <p className="mt-4 text-center text-xs text-slate-400">Supabase isn't configured — Demo Mode is available so you can still explore.</p>
      )}
    </AuthLayout>
  );
}
