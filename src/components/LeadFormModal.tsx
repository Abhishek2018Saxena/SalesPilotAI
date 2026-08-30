import { useState } from 'react';
import { Modal, Button, Input, Textarea, Select } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import type { Lead, LeadStage, BuyingIntent, Priority } from '@/types';

const STAGES: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Evaluation', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const INTENTS: BuyingIntent[] = ['High', 'Medium', 'Low'];
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id'>) => Promise<void>;
  initial?: Lead | null;
}

export function LeadFormModal({ open, onClose, onSave, initial }: LeadFormModalProps) {
  const [form, setForm] = useState<Omit<Lead, 'id'>>({
    name: initial?.name ?? '',
    company: initial?.company ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    stage: initial?.stage ?? 'New',
    buying_intent: initial?.buying_intent ?? 'Medium',
    priority: initial?.priority ?? 'Medium',
    deal_value: initial?.deal_value ?? 0,
    next_followup: initial?.next_followup ?? null,
    notes: initial?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit lead' : 'Create lead'} size="lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
        <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Technologies" />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="priya@example.com" />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (415) 555-0142" />
        <Select label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as LeadStage })}>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select label="Buying intent" value={form.buying_intent} onChange={(e) => setForm({ ...form, buying_intent: e.target.value as BuyingIntent })}>
          {INTENTS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </Select>
        <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Input label="Deal value ($)" type="number" value={form.deal_value} onChange={(e) => setForm({ ...form, deal_value: Number(e.target.value) })} />
        <Input label="Next follow-up" type="date" value={form.next_followup ?? ''} min={todayISO()} onChange={(e) => setForm({ ...form, next_followup: e.target.value || null })} />
        <div className="sm:col-span-2">
          <Textarea label="Notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Add notes about this lead..." />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>{initial ? 'Save changes' : 'Create lead'}</Button>
      </div>
    </Modal>
  );
}
