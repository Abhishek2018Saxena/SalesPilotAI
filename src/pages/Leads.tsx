import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowUpDown, Trash2, Pencil, Eye } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/context/ToastContext';
import { Card, CardBody, Button, Badge, Select, LoadingState, ErrorState, EmptyState } from '@/components/ui';
import { LeadFormModal } from '@/components/LeadFormModal';
import { priorityColor, intentColor, stageColor, formatCurrency, cn } from '@/lib/utils';
import { relativeDay, todayISO } from '@/lib/dates';
import type { Lead, LeadStage, BuyingIntent, Priority } from '@/types';

const STAGES: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Evaluation', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const INTENTS: BuyingIntent[] = ['High', 'Medium', 'Low'];
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
type SortKey = 'name' | 'company' | 'deal_value' | 'next_followup' | 'priority';
const PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function Leads() {
  const { leads, loading, error, reload, createLead, updateLead, deleteLead } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [intentFilter, setIntentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    let result = leads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
      const matchStage = !stageFilter || l.stage === stageFilter;
      const matchIntent = !intentFilter || l.buying_intent === intentFilter;
      const matchPriority = !priorityFilter || l.priority === priorityFilter;
      return matchSearch && matchStage && matchIntent && matchPriority;
    });
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'deal_value') cmp = (a.deal_value || 0) - (b.deal_value || 0);
      else if (sortKey === 'next_followup') cmp = (a.next_followup ?? '9999').localeCompare(b.next_followup ?? '9999');
      else if (sortKey === 'priority') cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [leads, search, stageFilter, intentFilter, priorityFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  async function handleSave(lead: Omit<Lead, 'id'>) {
    if (editing) {
      await updateLead(editing.id, lead);
      toast('Lead updated.');
    } else {
      const created = await createLead(lead);
      toast('Lead created.');
      if (created) navigate(`/leads/${created.id}`);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteLead(confirmDelete.id);
    toast('Lead deleted.', 'info');
    setConfirmDelete(null);
  }

  if (loading) return <LoadingState label="Loading leads..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your sales pipeline and track every prospect.</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4" /> Create lead
        </Button>
      </div>

      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, company, email..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              />
            </div>
          </div>
          <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)}>
            <option value="">All intents</option>
            {INTENTS.map((i) => <option key={i} value={i}>{i}</option>)}
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Create your first lead or adjust your filters."
          action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> Create lead</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3"><button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('name')}>Lead <ArrowUpDown className="h-3 w-3" /></button></th>
                  <th className="px-4 py-3"><button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('company')}>Company <ArrowUpDown className="h-3 w-3" /></button></th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3"><button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('deal_value')}>Value <ArrowUpDown className="h-3 w-3" /></button></th>
                  <th className="px-4 py-3"><button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('next_followup')}>Follow-up <ArrowUpDown className="h-3 w-3" /></button></th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/leads/${lead.id}`)} className="font-medium text-slate-900 hover:text-amber-600">{lead.name}</button>
                      <p className="text-xs text-slate-400">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{lead.company}</td>
                    <td className="px-4 py-3"><Badge className={intentColor(lead.buying_intent)}>{lead.buying_intent}</Badge></td>
                    <td className="px-4 py-3"><Badge className={priorityColor(lead.priority)}>{lead.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge className={stageColor(lead.stage)}>{lead.stage}</Badge></td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(lead.deal_value)}</td>
                    <td className={cn('px-4 py-3', lead.next_followup && lead.next_followup < todayISO() ? 'text-red-600' : 'text-slate-500')}>
                      {lead.next_followup ? relativeDay(lead.next_followup) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/leads/${lead.id}`)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="View"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => { setEditing(lead); setModalOpen(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setConfirmDelete(lead)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <LeadFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete lead?</h3>
            <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete <span className="font-medium text-slate-700">{confirmDelete.name}</span>? This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
