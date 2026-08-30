import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/types';

const DEMO_EMAIL = 'demo@salespilot.ai';
const DEMO_PASSWORD = 'Demo@12345';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, 'full_name' | 'email' | 'company'>>) => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  email: DEMO_EMAIL,
  full_name: 'Demo Rep',
  company: 'SalesPilot AI',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (!data.session) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          await loadProfile(sess.user.id, sess.user.email ?? '');
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string, email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      setProfile({ id: userId, email, full_name: '', company: '' });
      return;
    }
    if (!data) {
      const newProfile = { id: userId, email, full_name: '', company: '' };
      await supabase.from('profiles').insert(newProfile);
      setProfile(newProfile);
      return;
    }
    setProfile(data as Profile);
  }

  async function signIn(email: string, password: string) {
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      enterDemoMode();
      return { error: null };
    }
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Use Demo Mode to explore the app.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  function enterDemoMode() {
    setIsDemo(true);
    setProfile(DEMO_PROFILE);
    setUser(null);
    setSession(null);
    setLoading(false);
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Use Demo Mode to explore the app.' };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        company: '',
      });
    }
    return { error: null };
  }

  async function signOut() {
    setIsDemo(false);
    setProfile(null);
    setUser(null);
    setSession(null);
    if (isSupabaseConfigured) await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (!user) return;
    await loadProfile(user.id, user.email ?? '');
  }

  async function updateProfile(data: Partial<Pick<Profile, 'full_name' | 'email' | 'company'>>) {
    if (!user) return;
    await supabase.from('profiles').update(data).eq('id', user.id);
    await refreshProfile();
  }

  const value: AuthContextValue = {
    session,
    user,
    profile,
    loading,
    isDemo,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    enterDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
