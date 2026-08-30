export type BuyingIntent = 'High' | 'Medium' | 'Low';
export type Priority = 'High' | 'Medium' | 'Low';
export type RiskLevel = 'High' | 'Medium' | 'Low';

export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Evaluation'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  user_id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: LeadStage;
  buying_intent: BuyingIntent;
  priority: Priority;
  deal_value: number;
  next_followup: string | null;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConversationAnalysis {
  prospect_name: string;
  company: string;
  email: string;
  buying_intent: BuyingIntent;
  deal_stage: LeadStage;
  follow_up_required: boolean;
  risk_level: RiskLevel;
  next_best_action: string;
  reason: string;
  priority: Priority;
  priority_reasons: string[];
  customer_needs: string[];
  pain_points: string[];
  objections: string[];
  competitors: string[];
  commitments_salesperson: string[];
  commitments_prospect: string[];
  purchase_timeline: string;
  budget_signals: string;
  follow_up_date: string;
  urgency: string;
  decision_makers: string[];
  summary: string;
  demo_mode?: boolean;
}

export interface Conversation {
  id: string;
  user_id?: string;
  lead_id: string | null;
  conversation_text: string;
  source: string;
  analysis: ConversationAnalysis | null;
  created_at?: string;
  leads?: Lead | null;
}

export interface FollowUp {
  id: string;
  user_id?: string;
  lead_id: string | null;
  recommended_action: string;
  priority: Priority;
  due_date: string;
  due_time: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  leads?: Lead | null;
}

export interface Integration {
  id: string;
  user_id?: string;
  provider: string;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id?: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  read: boolean;
  created_at: string;
}

export interface SearchResult {
  id: string;
  type: 'lead' | 'company' | 'conversation';
  label: string;
  subtitle: string;
  href: string;
}
