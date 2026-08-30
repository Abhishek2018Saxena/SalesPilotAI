import type { BuyingIntent, Priority, RiskLevel } from '@/types';

export function priorityColor(priority: Priority | string | undefined): string {
  switch (priority) {
    case 'High':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function intentColor(intent: BuyingIntent | string | undefined): string {
  switch (intent) {
    case 'High':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Low':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function riskColor(risk: RiskLevel | string | undefined): string {
  switch (risk) {
    case 'High':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function stageColor(stage: string | undefined): string {
  switch (stage) {
    case 'Won':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Lost':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Negotiation':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Proposal':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Evaluation':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Qualified':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'Contacted':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
