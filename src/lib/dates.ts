export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISO(d);
}

export function addDaysISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/**
 * Convert natural-language follow-up date phrases into a real YYYY-MM-DD date.
 * Returns null if the input cannot be parsed. If the input is already an ISO
 * date, it is returned unchanged.
 */
export function normalizeFollowUpDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lower = trimmed.toLowerCase();

  if (lower === 'today') return toISO(today);
  if (lower === 'tomorrow') return addDaysISO(1);
  if (lower === 'yesterday') return addDaysISO(-1);
  if (lower === 'next week' || lower === 'in a week' || lower === 'within a week') return addDaysISO(7);
  if (lower === 'in two weeks' || lower === 'within two weeks') return addDaysISO(14);
  if (lower === 'this week') return addDaysISO(Math.max(1, 5 - today.getDay()));
  if (lower === 'next month') {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 1);
    return toISO(d);
  }

  const inN = lower.match(/^in\s+(\d+)\s+(day|week)s?$/);
  if (inN) {
    const n = parseInt(inN[1], 10);
    return inN[2] === 'week' ? addDaysISO(n * 7) : addDaysISO(n);
  }

  const withinN = lower.match(/^within\s+(\d+)\s+(day|week)s?$/);
  if (withinN) {
    const n = parseInt(withinN[1], 10);
    return withinN[2] === 'week' ? addDaysISO(n * 7) : addDaysISO(n);
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(0, 0, 0, 0);
    return toISO(parsed);
  }

  return null;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relativeDay(iso: string | null | undefined): string {
  if (!iso) return '—';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff > 0 && diff <= 7) return `In ${diff} days`;
  return formatDate(iso);
}
