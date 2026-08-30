import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Card, CardHeader, CardBody, CardTitle, Button, Input } from '@/components/ui';

export function Settings() {
  const { profile, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [company, setCompany] = useState(profile?.company ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [fuReminders, setFuReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await updateProfile({ full_name: fullName, email, company });
      toast('Profile updated.');
    } catch {
      toast('Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!isSupabaseConfigured) {
      toast('Supabase is not configured. Use Demo Mode.', 'info');
      return;
    }
    if (newPw.length < 8) {
      toast('New password must be at least 8 characters.', 'error');
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Password updated.');
    setCurrentPw('');
    setNewPw('');
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, security, and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company" />
          <div className="sm:col-span-2">
            <Button onClick={handleSaveProfile} loading={savingProfile}>Save profile</Button>
          </div>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-400" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Current password" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
            <Input label="New password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleChangePassword} loading={savingPw}>
              <KeyRound className="h-4 w-4" /> Change password
            </Button>
            <Button variant="outline" onClick={() => navigate('/reset-password')}>Reset password</Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-400" />
            <CardTitle>Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Email notifications</p>
              <p className="text-xs text-slate-500">Receive important updates via email.</p>
            </div>
            <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-amber-400 focus:ring-amber-400" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Follow-up reminders</p>
              <p className="text-xs text-slate-500">Get reminded about upcoming and overdue follow-ups.</p>
            </div>
            <input type="checkbox" checked={fuReminders} onChange={(e) => setFuReminders(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-amber-400 focus:ring-amber-400" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Daily summary</p>
              <p className="text-xs text-slate-500">Get a daily digest of your sales activity.</p>
            </div>
            <input type="checkbox" checked={dailySummary} onChange={(e) => setDailySummary(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-amber-400 focus:ring-amber-400" />
          </label>
          <Button variant="outline" size="sm" onClick={() => toast('Preferences saved.')}>Save preferences</Button>
        </CardBody>
      </Card>
    </div>
  );
}
