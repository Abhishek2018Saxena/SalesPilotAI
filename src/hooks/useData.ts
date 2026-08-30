import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DEMO_LEADS, DEMO_FOLLOW_UPS, DEMO_CONVERSATIONS } from '@/lib/demoData';
import type { Lead, FollowUp, Conversation, Integration, Subscription } from '@/types';

export function useData() {
  const { user, isDemo } = useAuth();
  const useDemo = !isSupabaseConfigured || isDemo || !user;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useDemo) {
        setLeads(DEMO_LEADS);
        setFollowUps(DEMO_FOLLOW_UPS);
        setConversations(DEMO_CONVERSATIONS);
        setIntegrations([]);
        setSubscription({
          id: 'demo-sub',
          user_id: 'demo',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          plan: 'free',
          status: 'active',
        });
      } else {
        const [l, f, c, i, s] = await Promise.all([
          supabase.from('leads').select('*').order('created_at', { ascending: false }),
          supabase.from('follow_ups').select('*, leads(*)').order('due_date', { ascending: true }),
          supabase.from('conversations').select('*, leads(*)').order('created_at', { ascending: false }),
          supabase.from('integrations').select('*'),
          supabase.from('subscriptions').select('*').maybeSingle(),
        ]);
        setLeads((l.data as Lead[]) ?? []);
        setFollowUps((f.data as FollowUp[]) ?? []);
        setConversations((c.data as Conversation[]) ?? []);
        setIntegrations((i.data as Integration[]) ?? []);
        setSubscription((s.data as Subscription) ?? null);
        if (l.error || f.error || c.error) throw new Error('Failed to load data');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [useDemo]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createLead = useCallback(
    async (lead: Omit<Lead, 'id'>): Promise<Lead | null> => {
      if (useDemo) {
        const newLead: Lead = { ...lead, id: `demo-lead-${Date.now()}` };
        setLeads((prev) => [newLead, ...prev]);
        return newLead;
      }
      const { data, error } = await supabase.from('leads').insert(lead).select().single();
      if (error) throw new Error(error.message);
      setLeads((prev) => [data as Lead, ...prev]);
      return data as Lead;
    },
    [useDemo]
  );

  const updateLead = useCallback(
    async (id: string, patch: Partial<Lead>): Promise<void> => {
      if (useDemo) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
        return;
      }
      const { error } = await supabase.from('leads').update(patch).eq('id', id);
      if (error) throw new Error(error.message);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    },
    [useDemo]
  );

  const deleteLead = useCallback(
    async (id: string): Promise<void> => {
      if (useDemo) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setFollowUps((prev) => prev.filter((f) => f.lead_id !== id));
        return;
      }
      await supabase.from('leads').delete().eq('id', id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    },
    [useDemo]
  );

  const createFollowUp = useCallback(
    async (fu: Omit<FollowUp, 'id'>): Promise<FollowUp | null> => {
      if (useDemo) {
        const newFu: FollowUp = { ...fu, id: `demo-fu-${Date.now()}` };
        setFollowUps((prev) => [newFu, ...prev]);
        return newFu;
      }
      const { data, error } = await supabase.from('follow_ups').insert(fu).select().single();
      if (error) throw new Error(error.message);
      setFollowUps((prev) => [data as FollowUp, ...prev]);
      return data as FollowUp;
    },
    [useDemo]
  );

  const updateFollowUp = useCallback(
    async (id: string, patch: Partial<FollowUp>): Promise<void> => {
      if (useDemo) {
        setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
        return;
      }
      const { error } = await supabase.from('follow_ups').update(patch).eq('id', id);
      if (error) throw new Error(error.message);
      setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    },
    [useDemo]
  );

  const createConversation = useCallback(
    async (conv: Omit<Conversation, 'id'>): Promise<Conversation | null> => {
      if (useDemo) {
        const newConv: Conversation = { ...conv, id: `demo-conv-${Date.now()}` };
        setConversations((prev) => [newConv, ...prev]);
        return newConv;
      }
      const { data, error } = await supabase.from('conversations').insert(conv).select().single();
      if (error) throw new Error(error.message);
      setConversations((prev) => [data as Conversation, ...prev]);
      return data as Conversation;
    },
    [useDemo]
  );

  const upsertIntegration = useCallback(
    async (provider: string, status: string, metadata: Record<string, unknown> = {}): Promise<void> => {
      if (useDemo) {
        setIntegrations((prev) => {
          const exists = prev.find((i) => i.provider === provider);
          if (exists) return prev.map((i) => (i.provider === provider ? { ...i, status, metadata } : i));
          return [...prev, { id: `demo-int-${Date.now()}`, provider, status, metadata }];
        });
        return;
      }
      const existing = integrations.find((i) => i.provider === provider);
      if (existing) {
        await supabase.from('integrations').update({ status, metadata }).eq('id', existing.id);
      } else {
        await supabase.from('integrations').insert({ provider, status, metadata });
      }
      setIntegrations((prev) => {
        const exists = prev.find((i) => i.provider === provider);
        if (exists) return prev.map((i) => (i.provider === provider ? { ...i, status, metadata } : i));
        return [...prev, { id: `int-${Date.now()}`, provider, status, metadata }];
      });
    },
    [useDemo, integrations]
  );

  return {
    useDemo,
    leads,
    followUps,
    conversations,
    integrations,
    subscription,
    loading,
    error,
    reload: loadAll,
    createLead,
    updateLead,
    deleteLead,
    createFollowUp,
    updateFollowUp,
    createConversation,
    upsertIntegration,
  };
}
