import { CreditCard, Check, Zap, AlertTriangle } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardBody, CardTitle, Button, Badge, LoadingState, ErrorState } from '@/components/ui';

const PLANS = [
  {
    name: 'FREE',
    price: '$0',
    period: 'forever',
    features: ['Demo Mode', 'Lead management', 'Conversation analysis', 'Follow-up management', 'Dashboard'],
  },
  {
    name: 'PRO',
    price: '$29',
    period: 'per user / month',
    features: ['Advanced AI', 'Gmail integration', 'CRM integrations', 'Advanced analytics', 'More usage', 'Priority features'],
  },
];

export function Billing() {
  const { subscription, loading, error, reload } = useData();
  const { toast } = useToast();

  if (loading) return <LoadingState label="Loading billing..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  const currentPlan = subscription?.plan ?? 'free';
  const isPro = currentPlan === 'pro';

  function handleUpgrade() {
    toast('Stripe is not configured. This is Demo Billing Mode.', 'info');
  }

  function handleManage() {
    toast('Stripe Customer Portal is not configured. (Demo Mode)', 'info');
  }

  function handleCancel() {
    toast('Cancel subscription is not configured. (Demo Mode)', 'info');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your subscription and payment method.</p>
      </div>

      {/* Demo billing notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Demo Billing Mode — Stripe is not configured. No real charges will be made.
        </div>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-900 p-2 text-amber-400">
                {isPro ? <Zap className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{isPro ? 'Pro' : 'Free'}</p>
                <p className="text-sm text-slate-500">{isPro ? '$29 / user / month' : 'No charge'}</p>
              </div>
            </div>
            <Badge className={isPro ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
              {isPro ? 'Active' : 'Free plan'}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {!isPro && <Button onClick={handleUpgrade}>Upgrade to Pro</Button>}
            {isPro && <Button variant="outline" onClick={handleManage}>Manage Subscription</Button>}
            {isPro && <Button variant="ghost" onClick={handleCancel}>Cancel Subscription</Button>}
          </div>
        </CardBody>
      </Card>

      {/* Plan comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrent = (plan.name === 'PRO' && isPro) || (plan.name === 'FREE' && !isPro);
          return (
            <Card key={plan.name} className={isCurrent ? 'border-2 border-amber-400' : ''}>
              <CardBody className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{plan.price}</p>
                  <p className="text-sm text-slate-500">{plan.period}</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>Current plan</Button>
                ) : plan.name === 'PRO' ? (
                  <Button className="w-full" onClick={handleUpgrade}>Upgrade to Pro</Button>
                ) : null}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
