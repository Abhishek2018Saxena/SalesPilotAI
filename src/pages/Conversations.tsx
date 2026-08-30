import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Zap, AlertTriangle, Brain, Copy, Save } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/context/ToastContext';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Badge,
  Textarea,
  Select,
  Modal,
  Field,
  List,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { analyzeConversation } from '@/lib/analyze';
import { SAMPLE_CONVERSATION } from '@/lib/demoData';
import { normalizeFollowUpDate, formatDate, todayISO } from '@/lib/dates';
import { priorityColor, intentColor, riskColor, stageColor } from '@/lib/utils';
import type { ConversationAnalysis, Lead } from '@/types';

export function Conversations() {
  const { leads, conversations, loading, error, reload, createLead, createConversation, createFollowUp } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [linkLeadId, setLinkLeadId] = useState<string>('create-new');
  const [saving, setSaving] = useState(false);

  async function handleAnalyze() {
    if (!text.trim()) {
      toast('Please paste a conversation to analyze.', 'error');
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeConversation(text);
      setAnalysis(result);
    } catch {
      toast('Failed to analyze conversation.', 'error');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleLoadSample() {
    setText(SAMPLE_CONVERSATION);
    setAnalysis(null);
  }

  async function handleSave() {
    if (!analysis) return;
    setSaving(true);
    try {
      let leadId = linkLeadId;

      if (linkLeadId === 'create-new') {
        const newLead = await createLead({
          name: analysis.prospect_name || 'New Prospect',
          company: analysis.company || '',
          email: analysis.email || '',
          phone: '',
          stage: analysis.deal_stage,
          buying_intent: analysis.buying_intent,
          priority: analysis.priority,
          deal_value: 0,
          next_followup: analysis.follow_up_required ? normalizeFollowUpDate(analysis.follow_up_date) : null,
          notes: analysis.summary || '',
        });
        if (newLead) leadId = newLead.id;
      }

      await createConversation({
        lead_id: leadId === 'create-new' ? null : leadId,
        conversation_text: text,
        source: 'manual',
        analysis,
      });

      if (analysis.follow_up_required && leadId && leadId !== 'create-new') {
        const fuDate = normalizeFollowUpDate(analysis.follow_up_date) ?? todayISO();
        await createFollowUp({
          lead_id: leadId,
          recommended_action: analysis.next_best_action,
          priority: analysis.priority,
          due_date: fuDate,
          due_time: '09:00',
          status: 'Pending',
        });
      }

      toast('Conversation and analysis saved.');
      setSaveModalOpen(false);
      if (leadId && leadId !== 'create-new') {
        navigate(`/leads/${leadId}`);
      } else {
        navigate('/leads');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading conversations..." />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Conversations</h1>
        <p className="mt-1 text-sm text-slate-500">Analyze sales calls, meeting notes, and email threads.</p>
      </div>

      {/* Analyzer */}
      <Card>
        <CardHeader><CardTitle>Analyze Conversation</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your sales call transcript, meeting notes, or email conversation here..."
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAnalyze} loading={analyzing}>
              <Sparkles className="h-4 w-4" /> Analyze Conversation
            </Button>
            <Button variant="outline" onClick={handleLoadSample}>Load sample</Button>
            {analysis && (
              <Button variant="secondary" onClick={() => setSaveModalOpen(true)}>
                <Save className="h-4 w-4" /> Save &amp; create follow-up
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Analysis output */}
      {analyzing && <LoadingState label="Analyzing conversation..." />}
      {analysis && !analyzing && (
        <div className="space-y-4">
          {analysis.demo_mode && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Generated in Demo Mode
            </div>
          )}

          {/* Top metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Buying Intent</p>
              <div className="mt-2"><Badge className={intentColor(analysis.buying_intent)}>{analysis.buying_intent}</Badge></div>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Deal Stage</p>
              <div className="mt-2"><Badge className={stageColor(analysis.deal_stage)}>{analysis.deal_stage}</Badge></div>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Follow-up</p>
              <div className="mt-2"><Badge className={analysis.follow_up_required ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>{analysis.follow_up_required ? 'Required' : 'Not required'}</Badge></div>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Risk</p>
              <div className="mt-2"><Badge className={riskColor(analysis.risk_level)}>{analysis.risk_level}</Badge></div>
            </Card>
          </div>

          {/* Next best action */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <CardTitle>Next Best Action</CardTitle>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-slate-800">{analysis.next_best_action}</p>
              <p className="mt-2 text-xs text-slate-400">{analysis.reason}</p>
            </CardBody>
          </Card>

          {/* AI Priority */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <CardTitle>AI Priority</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div><Badge className={priorityColor(analysis.priority)}>{analysis.priority} priority</Badge></div>
              <List items={analysis.priority_reasons} />
            </CardBody>
          </Card>

          {/* Needs / pains / objections */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Customer Needs</CardTitle></CardHeader>
              <CardBody><List items={analysis.customer_needs} /></CardBody>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pain Points</CardTitle></CardHeader>
              <CardBody><List items={analysis.pain_points} /></CardBody>
            </Card>
            <Card>
              <CardHeader><CardTitle>Objections</CardTitle></CardHeader>
              <CardBody><List items={analysis.objections} /></CardBody>
            </Card>
            <Card>
              <CardHeader><CardTitle>Competitors</CardTitle></CardHeader>
              <CardBody><List items={analysis.competitors} /></CardBody>
            </Card>
            <Card>
              <CardHeader><CardTitle>Commitments — Salesperson</CardTitle></CardHeader>
              <CardBody><List items={analysis.commitments_salesperson} /></CardBody>
            </Card>
            <Card>
              <CardHeader><CardTitle>Commitments — Prospect</CardTitle></CardHeader>
              <CardBody><List items={analysis.commitments_prospect} /></CardBody>
            </Card>
          </div>

          {/* Prospect details */}
          <Card>
            <CardHeader><CardTitle>Prospect Details</CardTitle></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Prospect">{analysis.prospect_name}</Field>
              <Field label="Company">{analysis.company}</Field>
              <Field label="Email">{analysis.email || '—'}</Field>
              <Field label="Purchase timeline">{analysis.purchase_timeline}</Field>
              <Field label="Budget signals">{analysis.budget_signals}</Field>
              <Field label="Follow-up date">{formatDate(analysis.follow_up_date)}</Field>
              <Field label="Urgency">{analysis.urgency}</Field>
              <Field label="Decision makers">{analysis.decision_makers.join(', ') || '—'}</Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Summary">{analysis.summary}</Field>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Conversation history */}
      <Card>
        <CardHeader><CardTitle>Saved Conversations</CardTitle></CardHeader>
        <CardBody className="p-0">
          {conversations.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No conversations saved yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map((c) => {
                const lead = leads.find((l) => l.id === c.lead_id);
                return (
                  <div
                    key={c.id}
                    className="cursor-pointer px-5 py-4 hover:bg-slate-50"
                    onClick={() => c.lead_id ? navigate(`/leads/${c.lead_id}`) : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <p className="text-sm font-medium text-slate-900">{c.analysis?.prospect_name ?? lead?.name ?? 'Unknown prospect'}</p>
                        <span className="text-xs text-slate-400">{c.analysis?.company ?? lead?.company ?? ''}</span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200">{c.source}</Badge>
                      {c.analysis && <Badge className={intentColor(c.analysis.buying_intent)}>{c.analysis.buying_intent} intent</Badge>}
                      {c.analysis?.demo_mode && <Badge className="bg-amber-50 text-amber-700 border-amber-200">Demo</Badge>}
                    </div>
                    {c.analysis?.summary && <p className="mt-1 text-xs text-slate-500">{c.analysis.summary}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Save modal */}
      <Modal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save conversation & create follow-up">
        <div className="space-y-4">
          <Select label="Link to lead" value={linkLeadId} onChange={(e) => setLinkLeadId(e.target.value)}>
            <option value="create-new">Create new lead from analysis</option>
            {leads.map((l: Lead) => (
              <option key={l.id} value={l.id}>{l.name} — {l.company}</option>
            ))}
          </Select>
          {analysis?.follow_up_required && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              A follow-up will be created for {formatDate(analysis.follow_up_date)}.
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSaveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
