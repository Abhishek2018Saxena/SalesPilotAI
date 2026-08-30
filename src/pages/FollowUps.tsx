import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, CalendarClock, ExternalLink, Mail } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/context/ToastContext';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Modal,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { priorityColor, intentColor, formatCurrency, cn } from '@/lib/utils';
import { todayISO, tomorrowISO, formatDate, relativeDay } from '@/lib/dates';
import type { FollowUp } from '@/types';

type Tab = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'completed';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Due Today' },
  { key: 'tomorrow', label: 'Due Tomorrow' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

export function FollowUps() {
  const { leads, followUps, loading, error, reload, updateFollowUp } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('today');
  const [rescheduleFu, setRescheduleFu] = useState<FollowUp | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const today = todayISO();
  const tomorrow = tomorrowISO();

  const filtered = followUps.filter((f) => {
    if (f.status === 'Completed') return tab === 'completed';
    switch (tab) {
      case 'overdue': return f.due_date < today;
      case 'today': return f.due_date === today;
      case 'tomorrow': return f.due_date === tomorrow;
      case 'upcoming': return f.due_date > tomorrow;
      default: return false;
    }
  });

  function getLead(fu: FollowUp) {
    return leads.find((l) => l.id === fu.lead_id);
  }

  async function handleComplete(fu: FollowUp) {
    await updateFollowUp(fu.id, { status: 'Completed' });
    toast('Follow-up completed.');
  }

  async function handleSnooze(fu: FollowUp) {
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

  if (loading) return <LoadingState label="Loading follow-ups..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1>
        <p className="mt-1 text-sm text-slate-500">Stay on top of every next action.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = followUps.filter((f) => {
            if (f.status === 'Completed') return t.key === 'completed';
            switch (t.key) {
              case 'overdue': return f.due_date < today;
              case 'today': return f.due_date === today;
              case 'tomorrow': return f.due_date === tomorrow;
              case 'upcoming': return f.due_date > tomorrow;
              default: return false;
            }
          }).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              {t.label} <span className="ml-1 text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No follow-ups here" description="Nothing scheduled for this tab." />
      ) : (
        <div className="space-y-3">
          {filtered.map((fu) => {
            const lead = getLead(fu);
            return (
              <Card key={fu.id}>
                <CardBody className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{lead?.name ?? 'Unknown lead'}</p>
                      <span className="text-xs text-slate-400">{lead?.company ?? ''}</span>
                    </div>
                    <p className="text-sm text-slate-600">{fu.recommended_action}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge className={priorityColor(fu.priority)}>{fu.priority}</Badge>
                      {lead && <Badge className={intentColor(lead.buying_intent)}>{lead.buying_intent} intent</Badge>}
                      {lead && <span className="text-xs text-slate-500">{formatCurrency(lead.deal_value)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <div className={cn('text-sm font-medium', fu.due_date < today && fu.status !== 'Completed' ? 'text-red-600' : 'text-slate-600')}>
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" />
                        {formatDate(fu.due_date)} at {fu.due_time}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{relativeDay(fu.due_date)}</div>
                    {fu.status === 'Completed' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleComplete(fu)}>
                          <Check className="h-3.5 w-3.5" /> Complete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSnooze(fu)}>
                          <Clock className="h-3.5 w-3.5" /> Snooze
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setRescheduleFu(fu); setRescheduleDate(fu.due_date); }}>
                          Reschedule
                        </Button>
                        {lead && (
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/leads/${lead.id}`)}>
                            <ExternalLink className="h-3.5 w-3.5" /> Open Lead
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => toast('Gmail is not connected. Use Copy on the lead page.', 'info')}>
                          <Mail className="h-3.5 w-3.5" /> Email
                        </Button>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

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
