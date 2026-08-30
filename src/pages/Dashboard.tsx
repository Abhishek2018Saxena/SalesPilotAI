import { useNavigate } from 'react-router-dom';
import {
  MessagesSquare,
  Flame,
  CalendarClock,
  AlertOctagon,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/hooks/useData';
import { Card, CardHeader, CardBody, CardTitle, Button, Badge, LoadingState, ErrorState, MetricBox } from '@/components/ui';
import { priorityColor, intentColor, stageColor, formatCurrency, cn } from '@/lib/utils';
import { todayISO, relativeDay } from '@/lib/dates';

export function Dashboard() {
  const { profile } = useAuth();
  const { leads, followUps, loading, error, reload } = useData();
  const navigate = useNavigate();

  const today = todayISO();
  const conversationsAnalyzed = 12;
  const highPriority = leads.filter((l) => l.priority === 'High').length;
  const dueToday = followUps.filter((f) => f.due_date === today && f.status !== 'Completed').length;
  const overdue = followUps.filter((f) => f.due_date < today && f.status !== 'Completed').length;
  const pipelineValue = leads
    .filter((l) => !['Won', 'Lost'].includes(l.stage))
    .reduce((sum, l) => sum + (l.deal_value || 0), 0);
  const wonDeals = leads.filter((l) => l.stage === 'Won').length;
  const totalClosed = leads.filter((l) => ['Won', 'Lost'].includes(l.stage)).length;
  const conversionRate = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = profile?.full_name?.split(' ')[0] || 'there';

  const recentLeads = [...leads]
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
    .slice(0, 5);

  if (loading) return <LoadingState label="Loading your workspace..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {displayName}.</h1>
        <p className="mt-1 text-slate-500">Here's where your attention will make the biggest difference today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricBox label="Conversations analyzed" value={conversationsAnalyzed} icon={<MessagesSquare className="h-5 w-5" />} accent="bg-blue-50 text-blue-600" />
        <MetricBox label="High priority" value={highPriority} icon={<Flame className="h-5 w-5" />} accent="bg-red-50 text-red-600" />
        <MetricBox label="Due today" value={dueToday} icon={<CalendarClock className="h-5 w-5" />} accent="bg-amber-50 text-amber-600" />
        <MetricBox label="Overdue" value={overdue} icon={<AlertOctagon className="h-5 w-5" />} accent="bg-red-50 text-red-600" />
        <MetricBox label="Pipeline value" value={formatCurrency(pipelineValue)} icon={<DollarSign className="h-5 w-5" />} accent="bg-emerald-50 text-emerald-600" />
        <MetricBox label="Conversion rate" value={`${conversionRate}%`} icon={<TrendingUp className="h-5 w-5" />} accent="bg-violet-50 text-violet-600" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/follow-ups')}>View follow-ups <ArrowRight className="h-4 w-4" /></Button>
        <Button variant="outline" onClick={() => navigate('/conversations')}>Analyze conversation</Button>
        <Button variant="outline" onClick={() => navigate('/leads')}>View leads</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Lead Signals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>View all</Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {lead.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={intentColor(lead.buying_intent)}>{lead.buying_intent} intent</Badge>
                  <Badge className={priorityColor(lead.priority)}>{lead.priority} priority</Badge>
                  <Badge className={stageColor(lead.stage)}>{lead.stage}</Badge>
                  <span className="text-sm font-medium text-slate-700">{formatCurrency(lead.deal_value)}</span>
                  <span className={cn('text-xs', lead.next_followup && lead.next_followup < today ? 'text-red-600' : 'text-slate-400')}>
                    {lead.next_followup ? relativeDay(lead.next_followup) : 'No follow-up'}
                  </span>
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/leads/${lead.id}`)}>Open</Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/conversations')}>Analyze</Button>
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">No leads yet.</p>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
