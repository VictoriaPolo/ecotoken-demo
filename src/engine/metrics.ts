import { balance } from './rules';
import type { Category, Economy, Tx } from './types';

export const isExchange = (t: Tx) => t.kind === 'compra' || t.kind === 'transferencia';

export interface Metrics {
  exchanges: number;
  activeMembers: number;
  totalMembers: number;
  orgs: number;
  circulating: number;
  volume30: number;
  velocity: number;
  emitted: number;
  weekly: { label: string; amount: number; count: number }[];
  byCategory: { category: Category; amount: number }[];
  links: { a: string; b: string; amount: number; count: number }[];
}

export const ACTIVE_WINDOW_DAYS = 30;

export function computeMetrics(e: Economy, weeks = 10): Metrics {
  const exchanges = e.ledger.filter(isExchange);
  const since = e.day - ACTIVE_WINDOW_DAYS;
  const circulating = e.members.reduce((s, m) => s + balance(m), 0);
  const volume30 = exchanges.filter((t) => t.day > since).reduce((s, t) => s + t.amount, 0);

  const weekly = Array.from({ length: weeks }, (_, i) => {
    const end = e.day - 7 * (weeks - 1 - i);
    const start = end - 6;
    const inWeek = exchanges.filter((t) => t.day >= start && t.day <= end);
    return {
      label: `S${Math.max(1, Math.ceil(end / 7))}`,
      amount: inWeek.reduce((s, t) => s + t.amount, 0),
      count: inWeek.length,
    };
  });

  const cats = new Map<Category, number>();
  for (const t of exchanges) {
    const c = t.category ?? 'servicio';
    cats.set(c, (cats.get(c) ?? 0) + t.amount);
  }
  for (const t of e.ledger) {
    if (t.kind === 'emision' && t.category) cats.set(t.category, (cats.get(t.category) ?? 0) + t.amount);
  }

  const pairs = new Map<string, { a: string; b: string; amount: number; count: number }>();
  for (const t of exchanges) {
    const [a, b] = [t.from, t.to].sort();
    const key = `${a}|${b}`;
    const link = pairs.get(key) ?? { a, b, amount: 0, count: 0 };
    link.amount += t.amount;
    link.count += 1;
    pairs.set(key, link);
  }

  return {
    exchanges: exchanges.length,
    activeMembers: e.members.filter((m) => m.lastMoveDay > since).length,
    totalMembers: e.members.length,
    orgs: e.members.filter((m) => m.role === 'organizacion').length,
    circulating,
    volume30,
    velocity: circulating ? volume30 / circulating : 0,
    emitted: e.ledger.filter((t) => t.kind === 'emision').reduce((s, t) => s + t.amount, 0),
    weekly,
    byCategory: [...cats.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((x, y) => y.amount - x.amount),
    links: [...pairs.values()],
  };
}
