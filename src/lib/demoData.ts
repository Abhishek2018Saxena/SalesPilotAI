import type { Lead, FollowUp, Conversation, AppNotification } from '@/types';
import { todayISO, tomorrowISO, toISO } from './dates';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export const DEMO_LEADS: Lead[] = [
  {
    id: 'demo-lead-1',
    name: 'Priya Sharma',
    company: 'Acme Technologies',
    email: 'priya@example.com',
    phone: '+1 (415) 555-0142',
    stage: 'Evaluation',
    buying_intent: 'High',
    priority: 'High',
    deal_value: 25000,
    next_followup: todayISO(),
    notes: 'Evaluating SalesPilot for a 20-rep team. Wants conversation analysis and CRM integration. Comparing competitors.',
    created_at: daysFromNow(-12),
    updated_at: daysFromNow(-2),
  },
  {
    id: 'demo-lead-2',
    name: 'Rahul Verma',
    company: 'Nova Systems',
    email: 'rahul@example.com',
    phone: '+1 (212) 555-0177',
    stage: 'Proposal',
    buying_intent: 'High',
    priority: 'High',
    deal_value: 42000,
    next_followup: tomorrowISO(),
    notes: 'Sent proposal last week. Awaiting feedback. Budget approved for Q3.',
    created_at: daysFromNow(-20),
    updated_at: daysFromNow(-5),
  },
  {
    id: 'demo-lead-3',
    name: 'Anita Desai',
    company: 'BrightScale',
    email: 'anita@example.com',
    phone: '+1 (646) 555-0190',
    stage: 'Qualified',
    buying_intent: 'Medium',
    priority: 'Medium',
    deal_value: 18000,
    next_followup: daysFromNow(3),
    notes: 'Qualified last month. Needs more info on enterprise security.',
    created_at: daysFromNow(-30),
    updated_at: daysFromNow(-7),
  },
  {
    id: 'demo-lead-4',
    name: 'Marcus Chen',
    company: 'Lumen Labs',
    email: 'marcus@example.com',
    phone: '+1 (312) 555-0123',
    stage: 'Negotiation',
    buying_intent: 'High',
    priority: 'High',
    deal_value: 64000,
    next_followup: daysFromNow(2),
    notes: 'Negotiating contract terms. Wants annual billing discount.',
    created_at: daysFromNow(-45),
    updated_at: daysFromNow(-1),
  },
  {
    id: 'demo-lead-5',
    name: 'Sofia Alvarez',
    company: 'Northwind Co',
    email: 'sofia@example.com',
    phone: '+1 (305) 555-0166',
    stage: 'Contacted',
    buying_intent: 'Low',
    priority: 'Low',
    deal_value: 9500,
    next_followup: daysFromNow(5),
    notes: 'Initial call completed. Not urgent. Re-engage next quarter.',
    created_at: daysFromNow(-8),
    updated_at: daysFromNow(-3),
  },
  {
    id: 'demo-lead-6',
    name: 'David Okonkwo',
    company: 'Vertex Global',
    email: 'david@example.com',
    phone: '+1 (713) 555-0188',
    stage: 'Won',
    buying_intent: 'High',
    priority: 'High',
    deal_value: 52000,
    next_followup: null,
    notes: 'Closed last week. Onboarding in progress.',
    created_at: daysFromNow(-60),
    updated_at: daysFromNow(-4),
  },
  {
    id: 'demo-lead-7',
    name: 'Emma Whitfield',
    company: 'Cascade Media',
    email: 'emma@example.com',
    phone: '+1 (206) 555-0144',
    stage: 'Lost',
    buying_intent: 'Low',
    priority: 'Low',
    deal_value: 12000,
    next_followup: null,
    notes: 'Went with a competitor. Revisit in 6 months.',
    created_at: daysFromNow(-90),
    updated_at: daysFromNow(-30),
  },
];

export const DEMO_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'demo-fu-1',
    lead_id: 'demo-lead-1',
    recommended_action: 'Send pricing and schedule the product review call.',
    priority: 'High',
    due_date: todayISO(),
    due_time: '10:00',
    status: 'Pending',
    created_at: daysFromNow(-2),
  },
  {
    id: 'demo-fu-2',
    lead_id: 'demo-lead-3',
    recommended_action: 'Follow up on proposal feedback.',
    priority: 'High',
    due_date: daysFromNow(-3),
    due_time: '14:00',
    status: 'Pending',
    created_at: daysFromNow(-6),
  },
  {
    id: 'demo-fu-3',
    lead_id: 'demo-lead-2',
    recommended_action: 'Send contract terms for annual billing.',
    priority: 'High',
    due_date: tomorrowISO(),
    due_time: '09:30',
    status: 'Pending',
    created_at: daysFromNow(-1),
  },
  {
    id: 'demo-fu-4',
    lead_id: 'demo-lead-4',
    recommended_action: 'Share enterprise security one-pager.',
    priority: 'Medium',
    due_date: daysFromNow(3),
    due_time: '11:00',
    status: 'Pending',
    created_at: daysFromNow(-1),
  },
  {
    id: 'demo-fu-5',
    lead_id: 'demo-lead-5',
    recommended_action: 'Re-engage with product update announcement.',
    priority: 'Low',
    due_date: daysFromNow(5),
    due_time: '15:00',
    status: 'Pending',
    created_at: daysFromNow(-3),
  },
  {
    id: 'demo-fu-6',
    lead_id: 'demo-lead-6',
    recommended_action: 'Check in on onboarding progress.',
    priority: 'Medium',
    due_date: daysFromNow(-1),
    due_time: '12:00',
    status: 'Completed',
    created_at: daysFromNow(-7),
  },
  {
    id: 'demo-fu-7',
    lead_id: 'demo-lead-1',
    recommended_action: 'Send case study relevant to their use case.',
    priority: 'Medium',
    due_date: daysFromNow(-5),
    due_time: '10:00',
    status: 'Completed',
    created_at: daysFromNow(-10),
  },
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'demo-conv-1',
    lead_id: 'demo-lead-1',
    conversation_text: 'Prospect: Hi, we are evaluating SalesPilot for our sales team of 20 reps...',
    source: 'call',
    analysis: null,
    created_at: daysFromNow(-2),
  },
  {
    id: 'demo-conv-2',
    lead_id: 'demo-lead-2',
    conversation_text: 'Email thread about proposal terms and annual billing.',
    source: 'email',
    analysis: null,
    created_at: daysFromNow(-5),
  },
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Follow-up due today',
    description: 'Priya Sharma follow-up is due today.',
    type: 'warning',
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'High-intent lead',
    description: 'Rahul Verma is a high-intent lead.',
    type: 'info',
    read: false,
    created_at: daysFromNow(-1) + 'T09:00:00Z',
  },
  {
    id: 'n3',
    title: 'Overdue follow-up',
    description: 'You have 1 overdue follow-up.',
    type: 'danger',
    read: false,
    created_at: daysFromNow(-1) + 'T08:00:00Z',
  },
];

export const SAMPLE_CONVERSATION = `Prospect: Hi, we're evaluating SalesPilot for our sales team. We currently have around 20 reps and follow-ups are being tracked manually.

Sales Rep: What are the biggest problems with the current process?

Prospect: Reps often forget to follow up after calls. We also don't have a good way to identify which prospects are actually ready to buy.

Sales Rep: What would you need from a solution?

Prospect: We'd want conversation analysis, buying-intent detection, automatic follow-up recommendations and CRM integration.

Sales Rep: Would you be interested in scheduling a product review?

Prospect: Yes. Please send me pricing and let's schedule a call next week. We are comparing a couple of other solutions as well.

Sales Rep: I'll send the pricing information and follow up to schedule the call.`;
