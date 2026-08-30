import type { ConversationAnalysis, BuyingIntent, Priority, RiskLevel, LeadStage } from '@/types';
import { normalizeFollowUpDate, addDaysISO } from './dates';

interface IntentSignal {
  keywords: string[];
  weight: number;
}

const HIGH_INTENT_SIGNALS: IntentSignal[] = [
  { keywords: ['pricing', 'price', 'quote', 'budget', 'contract', 'sign', 'buy', 'purchase', 'ready to move', 'timeline'], weight: 2 },
  { keywords: ['schedule a call', 'product review', 'demo', 'evaluation', 'evaluate', 'interested', 'send me', 'lets schedule', "let's schedule"], weight: 2 },
  { keywords: ['decision maker', 'approval', 'approved', 'stakeholder', 'champion'], weight: 1 },
];

const RISK_SIGNALS = [
  'comparing', 'competitor', 'competitors', 'alternative', 'other solutions', 'too expensive', 'budget concern',
  'not sure', 'hesitant', 'delay', 'postpone', 'next quarter', 'next year', 'no budget',
];

const NEED_SIGNALS = [
  'conversation analysis', 'buying intent', 'follow-up', 'follow up', 'crm integration', 'automation',
  'tracking', 'pipeline', 'analytics', 'reporting', 'sales rep', 'sales team',
];

const PAIN_SIGNALS = [
  'forget to follow up', 'missed follow', 'manual', 'manual tracking', 'no good way', 'dont have a good way',
  "don't have a good way", 'spending too much time', 'time consuming', 'no visibility',
];

function countMatches(text: string, signals: IntentSignal[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const sig of signals) {
    for (const kw of sig.keywords) {
      if (lower.includes(kw)) score += sig.weight;
    }
  }
  return score;
}

function hasAny(text: string, words: string[]): string[] {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w.toLowerCase()));
}

function extractProspectName(text: string): string {
  const m = text.match(/Prospect:\s*Hi,?\s*(?:I'm|I am|my name is|this is)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (m) return m[1].trim();
  const m2 = text.match(/Prospect:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  return m2 ? m2[1].trim() : 'Unknown Prospect';
}

function extractCompany(text: string): string {
  const m = text.match(/(?:from|at|with|company[:\s]+)\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)?)/);
  return m ? m[1].trim() : 'Unknown Company';
}

function extractEmail(text: string): string {
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return m ? m[0] : '';
}

function inferStage(text: string): LeadStage {
  const lower = text.toLowerCase();
  if (lower.match(/negotiat|contract|sign|final/)) return 'Negotiation';
  if (lower.match(/proposal|quote|pricing/)) return 'Proposal';
  if (lower.match(/evaluat|review|demo|product/)) return 'Evaluation';
  if (lower.match(/qualif|need|require|problem/)) return 'Qualified';
  if (lower.match(/contact|reach|call|spoke/)) return 'Contacted';
  return 'New';
}

function inferTimeline(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('next week')) return 'Next week';
  if (lower.includes('this week')) return 'This week';
  if (lower.includes('next month')) return 'Next month';
  if (lower.includes('this month')) return 'This month';
  if (lower.includes('this quarter')) return 'This quarter';
  if (lower.includes('next quarter')) return 'Next quarter';
  if (lower.includes('immediate') || lower.includes('asap')) return 'Immediate';
  return 'Not specified';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildSummary(text: string, intent: BuyingIntent, followUp: boolean, risk: RiskLevel): string {
  const name = extractProspectName(text);
  const company = extractCompany(text);
  const parts: string[] = [];
  parts.push(`${name} from ${company} engaged in a sales conversation.`);
  parts.push(`Buying intent appears ${intent.toLowerCase()}.`);
  if (followUp) parts.push('A follow-up was requested.');
  if (risk !== 'Low') parts.push(`Some risk signals detected (${risk.toLowerCase()}).`);
  return parts.join(' ');
}

/**
 * Deterministic local analysis used in Demo Mode (no OpenAI key).
 */
export function analyzeConversationLocal(text: string): ConversationAnalysis {
  const lower = text.toLowerCase();
  const intentScore = countMatches(text, HIGH_INTENT_SIGNALS);
  const riskHits = hasAny(text, RISK_SIGNALS);
  const needHits = hasAny(text, NEED_SIGNALS);
  const painHits = hasAny(text, PAIN_SIGNALS);

  let buyingIntent: BuyingIntent = 'Low';
  if (intentScore >= 5) buyingIntent = 'High';
  else if (intentScore >= 2) buyingIntent = 'Medium';

  let riskLevel: RiskLevel = 'Low';
  if (riskHits.length >= 2) riskLevel = 'High';
  else if (riskHits.length === 1) riskLevel = 'Medium';

  const followUpRequired = intentScore >= 2 || lower.includes('follow up') || lower.includes('schedule');

  let priority: Priority = 'Low';
  if (buyingIntent === 'High' && riskLevel !== 'Low') priority = 'High';
  else if (buyingIntent === 'High' || (buyingIntent === 'Medium' && riskLevel === 'Low')) priority = 'Medium';
  else if (buyingIntent === 'Medium') priority = 'Medium';

  const timeline = inferTimeline(text);
  let followUpDate = normalizeFollowUpDate(timeline);
  if (!followUpDate) {
    followUpDate = followUpRequired ? addDaysISO(7) : addDaysISO(14);
  }

  const competitors = riskHits.filter((w) =>
    ['comparing', 'competitor', 'competitors', 'alternative', 'other solutions'].includes(w)
  );

  const reasons: string[] = [];
  if (buyingIntent === 'High') reasons.push('Strong buying-intent language detected');
  if (followUpRequired) reasons.push('Prospect requested follow-up');
  if (riskHits.length > 0) reasons.push('Competitor comparison signals present');
  if (reasons.length === 0) reasons.push('Limited intent signals in conversation');

  const needs = needHits.length > 0 ? Array.from(new Set(needHits.map(capitalize))) : ['Conversation analysis', 'Follow-up recommendations'];
  const pains = painHits.length > 0 ? Array.from(new Set(painHits.map(capitalize))) : ['Manual tracking'];

  const nextBestAction = followUpRequired
    ? 'Send pricing and schedule the product review call.'
    : 'Send a brief check-in email to keep the conversation warm.';

  return {
    prospect_name: extractProspectName(text),
    company: extractCompany(text),
    email: extractEmail(text),
    buying_intent: buyingIntent,
    deal_stage: inferStage(text),
    follow_up_required: followUpRequired,
    risk_level: riskLevel,
    next_best_action: nextBestAction,
    reason: reasons.join('. '),
    priority,
    priority_reasons: reasons,
    customer_needs: needs,
    pain_points: pains,
    objections: competitors.length > 0 ? ['Comparing competitors'] : [],
    competitors: competitors.length > 0 ? ['Competitor A', 'Competitor B'] : [],
    commitments_salesperson: lower.includes('pricing') ? ['Send pricing information'] : [],
    commitments_prospect: lower.includes('schedule') ? ['Schedule a product review call'] : [],
    purchase_timeline: timeline,
    budget_signals: lower.includes('budget') ? 'Budget mentioned' : 'Not discussed',
    follow_up_date: followUpDate,
    urgency: buyingIntent === 'High' ? 'High' : buyingIntent === 'Medium' ? 'Medium' : 'Low',
    decision_makers: ['Prospect (evaluator)'],
    summary: buildSummary(text, buyingIntent, followUpRequired, riskLevel),
    demo_mode: true,
  };
}

/**
 * Calls the server-side analyze-conversation edge function when available.
 * Falls back to local analysis on any error.
 */
export async function analyzeConversation(text: string): Promise<ConversationAnalysis> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (supabaseUrl && anonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/analyze-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.analysis && data.analysis.buying_intent) {
          const analysis = data.analysis as ConversationAnalysis;
          analysis.follow_up_date = normalizeFollowUpDate(analysis.follow_up_date) ?? analysis.follow_up_date;
          return analysis;
        }
      }
    } catch {
      // fall through to local
    }
  }
  return analyzeConversationLocal(text);
}
