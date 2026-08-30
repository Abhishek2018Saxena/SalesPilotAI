import { useState } from 'react';
import { Mail, Plug, CheckCircle2, XCircle, RefreshCw, Upload, AlertTriangle } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardBody, CardTitle, Button, Badge, LoadingState, ErrorState } from '@/components/ui';

const PROVIDERS = [
  { id: 'gmail', name: 'Gmail', icon: Mail, desc: 'Send and draft follow-up emails directly from SalesPilot.' },
  { id: 'hubspot', name: 'HubSpot', icon: Plug, desc: 'Sync leads and push deals to your HubSpot CRM.' },
  { id: 'salesforce', name: 'Salesforce', icon: Plug, desc: 'Sync leads and push deals to your Salesforce CRM.' },
];

export function Integrations() {
  const { integrations, loading, error, reload, upsertIntegration } = useData();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  function getStatus(provider: string): string {
    const int = integrations.find((i) => i.provider === provider);
    return int?.status ?? 'disconnected';
  }

  async function handleConnect(provider: string) {
    setConnecting(provider);
    // In production this would redirect to OAuth flow
    await new Promise((r) => setTimeout(r, 800));
    await upsertIntegration(provider, 'connected', { connected_at: new Date().toISOString() });
    setConnecting(null);
    toast(`${provider} connected.`);
  }

  async function handleDisconnect(provider: string) {
    await upsertIntegration(provider, 'disconnected', {});
    toast(`${provider} disconnected.`, 'info');
  }

  async function handleSync(provider: string) {
    toast(`Syncing leads with ${provider}... (Demo Mode)`, 'info');
  }

  if (loading) return <LoadingState label="Loading integrations..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="mt-1 text-sm text-slate-500">Connect your tools to sync data and automate workflows.</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Demo Mode — Gmail and CRM integrations are not connected. The app continues to work.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {PROVIDERS.map((p) => {
          const status = getStatus(p.id);
          const connected = status === 'connected';
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-900 p-2 text-amber-400">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{p.name}</CardTitle>
                      <p className="text-xs text-slate-500">{p.desc}</p>
                    </div>
                  </div>
                  <Badge className={connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}>
                    {connected ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</span>
                    ) : (
                      <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Not connected</span>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {connected ? (
                  <>
                    <p className="text-sm text-slate-600">
                      {p.id === 'gmail'
                        ? 'You can send and draft follow-up emails from lead pages.'
                        : 'You can sync leads and push deals to your CRM.'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.id !== 'gmail' && (
                        <Button size="sm" variant="outline" onClick={() => handleSync(p.id)}>
                          <RefreshCw className="h-3.5 w-3.5" /> Sync leads
                        </Button>
                      )}
                      {p.id !== 'gmail' && (
                        <Button size="sm" variant="outline" onClick={() => toast(`Pushing lead to ${p.name}... (Demo Mode)`, 'info')}>
                          <Upload className="h-3.5 w-3.5" /> Push lead
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDisconnect(p.id)}>Disconnect</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500">
                      {p.id === 'gmail'
                        ? 'Connect via secure OAuth to send emails without sharing your password.'
                        : 'Connect via secure OAuth to sync your pipeline automatically.'}
                    </p>
                    <Button size="sm" onClick={() => handleConnect(p.id)} loading={connecting === p.id}>
                      Connect {p.name}
                    </Button>
                  </>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
