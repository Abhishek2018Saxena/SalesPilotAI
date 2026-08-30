import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Plus,
  Phone,
  Building2,
  DollarSign,
  CalendarClock,
  Zap,
  Copy,
  Send,
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/context/ToastContext';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Badge,
  Field,
  List,
  LoadingState,
  ErrorState,
  EmptyState,
  Modal,
  Textarea,
} from '@/components/ui';
import { LeadFormModal } from '@/components/LeadFormModal';
import { priorityColor, intentColor, stageColor, riskColor, formatCurrency, cn } from '@/lib/utils';
import { formatDate, relativeDay, todayISO, tomorrowISO } from '@/lib/dates';
import type { Lead, FollowUp } from '@/types';

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    leads,
    followUps,
    conversations,
    loading,
    error,
    reload,
    updateLead,
    deleteLead,
    createFollowUp,
    updateFollowUp,
  } = useData();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [fuModalOpen, setFuModalOpen] = useState(false);
  const [rescheduleFu, setRescheduleFu] = useState<FollowUp | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const lead = leads.find((l) => l.id === id) ?? null;
  const leadFollowUps = followUps.filter((f) => f.lead_id === id);
  const leadConversations = conversations.filter((c) => c.lead_id === id);

  if (loading) return <LoadingState label="Loading lead..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!lead) {
    return (
      <EmptyState
        title="Lead not found"
        description="This lead may have been deleted."
        action={<Button onClick={() => navigate('/leads')}>Back to leads</Button>}
      />
    );
  }

  async function handleEditSave(patch: Omit<Lead, 'id'>) {
    if (!lead) return;
    await updateLead(lead.id, patch);
    toast('Lead updated.');
  }

  async function handleDelete() {
    if (!lead) return;
    await deleteLead(lead.id);
    toast('Lead deleted.', 'info');
    navigate('/leads');
  }

  async function handleCompleteFu(fu: FollowUp) {
    await updateFollowUp(fu.id, { status: 'Completed' });
    toast('Follow-up completed.');
  }

  async function handleSnoozeFu(fu: FollowUp) {
    await updateFollowUp(fu.id, { due_date: tomorrowISO() });
    toast('Follow-up snoozed to tomorrow.');
  }

  async function handleReschedule() {
    if (!rescheduleFu || !rescheduleDate) return;
    await updateFollowUp(rescheduleFu.id, { due_date: rescheduleDate });
    toast('Follow-up rescheduled.');
    setRescheduleFu(null);
    setRescheduleDate('');
  }

  async function handleCreateFu() {
    if (!lead) return;
    await createFollowUp({
      lead_id: lead.id,
      recommended_action: 'Follow up with ' + lead.name,
      priority: lead.priority,
      due_date: todayISO(),
      due_time: '09:00',
      status: 'Pending',
    });
    toast('Follow-up created.');
    setFuModalOpen(false);
  }

  function generateEmail() {
    if (!lead) return { subject: '', body: '' };
    const subject = `Following up — ${lead.company} & SalesPilot AI`;
    const body = `Hi ${lead.name.split(' ')[0]},

Thank you for the recent conversation about ${lead.company}'s sales process. Based on our discussion, I wanted to follow up with the next steps.

${lead.notes || 'I wanted to share some additional information and schedule a time to continue our conversation.'}

Given your interest in improving your team's follow-up process, I'd recommend we schedule a brief call this week to discuss how SalesPilot AI can help ${lead.company} automate conversation analysis and never miss a follow-up.

Would ${relativeDay(lead.next_followup ?? todayISO())} work for a quick 20-minute review?

Best regards,
Your SalesPilot AI Team`;
    return { subject, body };
  }

  const email = generateEmail();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/leads" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to leads
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEmailModalOpen(true)}>
            <Mail className="h-4 w-4" /> Draft Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Header card */}
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
              {lead.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
              <p className="text-slate-500">{lead.company}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className={intentColor(lead.buying_intent)}>{lead.buying_intent} intent</Badge>
                <Badge className={priorityColor(lead.priority)}>{lead.priority} priority</Badge>
                <Badge className={stageColor(lead.stage)}>{lead.stage}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(lead.deal_value)}</p>
            <p className="text-sm text-slate-500">Deal value</p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Email"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />{lead.email || '—'}</div></Field>
              <Field label="Phone"><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{lead.phone || '—'}</div></Field>
              <Field label="Company"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{lead.company || '—'}</div></Field>
              <Field label="Deal value"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-slate-400" />{formatCurrency(lead.deal_value)}</div></Field>
              <Field label="Stage"><Badge className={stageColor(lead.stage)}>{lead.stage}</Badge></Field>
              <Field label="Next follow-up"><div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-400" />{lead.next_followup ? relativeDay(lead.next_followup) : 'Not scheduled'}</div></Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardBody>
              {lead.notes ? <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.notes}</p> : <p className="text-sm text-slate-400">No notes yet.</p>}
            </CardBody>
          </Card>

          {/* Conversations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/conversations')}>Analyze new</Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {leadConversations.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No conversations analyzed yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leadConversations.map((c) => (
                    <div key={c.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase text-slate-400">{c.source}</span>
                        <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{c.conversation_text.slice(0, 120)}{c.conversation_text.length > 120 ? '...' : ''}</p>
                      {c.analysis && (
                        <div className="mt-2 flex gap-2">
                          <Badge className={intentColor(c.analysis.buying_intent)}>{c.analysis.buying_intent} intent</Badge>
                          {c.analysis.demo_mode && <Badge className="bg-slate-100 text-slate-600 border-slate-200">Demo Mode</Badge>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: follow-ups + next action */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recommended next action</CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-slate-700">
                {leadConversations[0]?.analysis?.next_best_action ?? 'Analyze a conversation to get an AI-recommended next action.'}
              </p>
              {leadConversations[0]?.analysis && (
                <div className="mt-3">
                  <Badge className={riskColor(leadConversations[0].analysis.risk_level)}>Risk: {leadConversations[0].analysis.risk_level}</Badge>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Follow-ups</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setFuModalOpen(true)}><Plus className="h-3 w-3" /> Add</Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {leadFollowUps.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-slate-400">No follow-ups yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leadFollowUps.map((fu) => (
                    <div key={fu.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <Badge className={priorityColor(fu.priority)}>{fu.priority}</Badge>
                        <span className={cn('text-xs', fu.status === 'Completed' ? 'text-emerald-600' : fu.due_date < todayISO() ? 'text-red-600' : 'text-slate-400')}>
                          {fu.status === 'Completed' ? 'Completed' : relativeDay(fu.due_date)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{fu.recommended_action}</p>
                      <p className="text-xs text-slate-400">Due: {formatDate(fu.due_date)} at {fu.due_time}</p>
                      {fu.status !== 'Completed' && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleCompleteFu(fu)}>Complete</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleSnoozeFu(fu)}>Snooze</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setRescheduleFu(fu); setRescheduleDate(fu.due_date); }}>Reschedule</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <LeadFormModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleEditSave} initial={lead} />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setConfirmDelete(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete lead?</h3>
            <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete <span className="font-medium text-slate-700">{lead.name}</span>? This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Email draft modal */}
      <Modal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} title="Draft follow-up email" size="lg">
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-slate-400">To</p>
            <p className="text-sm text-slate-800">{lead.email || 'No email on file'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-slate-400">Subject</p>
            <input
              defaultValue={email.subject}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-slate-400">Body</p>
            <Textarea rows={12} defaultValue={email.body} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(`Subject: ${email.subject}\n\n${email.body}`); toast('Email copied to clipboard.'); }}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button onClick={() => { toast('Gmail is not connected. Use Copy to paste into your email client.', 'info'); }}>
              <Send className="h-4 w-4" /> Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create follow-up confirm */}
      {fuModalOpen && (
        <Modal open={fuModalOpen} onClose={() => setFuModalOpen(false)} title="Create follow-up">
          <p className="text-sm text-slate-600">Create a new follow-up for {lead.name} due today?</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFuModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFu}>Create</Button>
          </div>
        </Modal>
      )}

      {/* Reschedule modal */}
      {rescheduleFu && (
        <Modal open={!!rescheduleFu} onClose={() => setRescheduleFu(null)} title="Reschedule follow-up">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{rescheduleFu.recommended_action}</p>
            <input
              type="date"
              value={rescheduleDate}
              min={todayISO()}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduleFu(null)}>Cancel</Button>
              <Button onClick={handleReschedule}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
