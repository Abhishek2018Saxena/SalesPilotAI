import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    if (password !== confirm) { toast('Passwords do not match', 'error'); return; }
    if (!isSupabaseConfigured) { toast('Supabase is not configured. Use Demo Mode to explore.', 'info'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Password updated. Please log in.');
    navigate('/login');
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a new password for your account."
      footer={<Link to="/login" className="font-medium text-amber-600 hover:text-amber-700">Back to login</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="password" type="password" label="New password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        <Input id="confirm" type="password" label="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
        <Button type="submit" className="w-full" size="lg" loading={loading}>Update password</Button>
      </form>
    </AuthLayout>
  );
}
