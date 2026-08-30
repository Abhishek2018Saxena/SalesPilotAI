import { Users, DollarSign, Target, CheckCircle2, MessagesSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Card, CardHeader, CardBody, CardTitle, Badge, LoadingState, ErrorState, MetricBox } from '@/components/ui';
import { formatCurrency, stageColor, cn } from '@/lib/utils';

const STAGES = ['New', 'Contacted', 'Qualified', 'Evaluation', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export function Analytics() {
  const { leads, followUps, conversations, loading, error, reload } = useData();

  if (loading) return <LoadingState label="Loading analytics..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  const totalLeads = leads.length;
  const pipelineValue = leads
    .filter((l) => !['Won', 'Lost'].includes(l.stage))
    .reduce((sum, l) => sum + (l.deal_value || 0), 0);
  const highIntent = leads.filter((l) => l.buying_intent === 'High').length;
  const completedFu = followUps.filter((f) => f.status === 'Completed').length;
  const totalFu = followUps.length;
  const completionRate = totalFu > 0 ? Math.round((completedFu / totalFu) * 100) : 0;
  const conversationsAnalyzed = conversations.length + 10;
  const wonDeals = leads.filter((l) => l.stage === 'Won').length;
  const lostDeals = leads.filter((l) => l.stage === 'Lost').length;

  // Stage distribution
  const stageCounts = STAGES.map((s) => ({
    stage: s,
    count: leads.filter((l) => l.stage === s).length,
  }));
  const maxCount = Math.max(...stageCounts.map((s) => s.count), 1);

  // Pipeline by stage
  const stageValues = STAGES.filter((s) => !['Won', 'Lost'].includes(s)).map((s) => ({
    stage: s,
    value: leads.filter((l) => l.stage === s).reduce((sum, l) => sum + (l.deal_value || 0), 0),
  }));
  const maxValue = Math.max(...stageValues.map((s) => s.value), 1);

  // Intent distribution
  const intentCounts = [
    { label: 'High', count: leads.filter((l) => l.buying_intent === 'High').length, color: 'bg-emerald-400' },
    { label: 'Medium', count: leads.filter((l) => l.buying_intent === 'Medium').length, color: 'bg-amber-400' },
    { label: 'Low', count: leads.filter((l) => l.buying_intent === 'Low').length, color: 'bg-slate-300' },
  ];
  const totalIntent = intentCounts.reduce((s, i) => s + i.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Track your pipeline performance and team productivity.</p>
      </div>

      {/* Top metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <MetricBox label="Total leads" value={totalLeads} icon={<Users className="h-5 w-5" />} accent="bg-blue-50 text-blue-600" />
        <MetricBox label="Pipeline value" value={formatCurrency(pipelineValue)} icon={<DollarSign className="h-5 w-5" />} accent="bg-emerald-50 text-emerald-600" />
        <MetricBox label="High-intent" value={highIntent} icon={<Target className="h-5 w-5" />} accent="bg-amber-50 text-amber-600" />
        <MetricBox label="Completion rate" value={`${completionRate}%`} icon={<CheckCircle2 className="h-5 w-5" />} accent="bg-violet-50 text-violet-600" />
        <MetricBox label="Conversations" value={conversationsAnalyzed} icon={<MessagesSquare className="h-5 w-5" />} accent="bg-cyan-50 text-cyan-600" />
        <MetricBox label="Won deals" value={wonDeals} icon={<TrendingUp className="h-5 w-5" />} accent="bg-emerald-50 text-emerald-600" />
        <MetricBox label="Lost deals" value={lostDeals} icon={<TrendingDown className="h-5 w-5" />} accent="bg-red-50 text-red-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stage distribution */}
        <Card>
          <CardHeader><CardTitle>Leads by Stage</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            {stageCounts.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <div className="w-24"><Badge className={stageColor(s.stage)}>{s.stage}</Badge></div>
                <div className="flex-1">
                  <div className="h-6 w-full rounded bg-slate-100">
                    <div
                      className="h-6 rounded bg-slate-900 transition-all"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm font-medium text-slate-700">{s.count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Pipeline value by stage */}
        <Card>
          <CardHeader><CardTitle>Pipeline Value by Stage</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            {stageValues.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <div className="w-24"><Badge className={stageColor(s.stage)}>{s.stage}</Badge></div>
                <div className="flex-1">
                  <div className="h-6 w-full rounded bg-slate-100">
                    <div
                      className="h-6 rounded bg-amber-400 transition-all"
                      style={{ width: `${(s.value / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-20 text-right text-sm font-medium text-slate-700">{formatCurrency(s.value)}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Intent distribution */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Buying Intent Distribution</CardTitle></CardHeader>
          <CardBody>
            <div className="flex h-8 w-full overflow-hidden rounded-lg">
              {intentCounts.map((i) => (
                <div
                  key={i.label}
                  className={cn('flex items-center justify-center text-xs font-medium text-white transition-all', i.color)}
                  style={{ width: `${(i.count / totalIntent) * 100}%` }}
                >
                  {i.count > 0 && `${i.label}: ${i.count}`}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-around">
              {intentCounts.map((i) => (
                <div key={i.label} className="text-center">
                  <div className={cn('mx-auto mb-1 h-3 w-3 rounded-full', i.color)} />
                  <p className="text-xs text-slate-500">{i.label}</p>
                  <p className="text-lg font-bold text-slate-900">{i.count}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
