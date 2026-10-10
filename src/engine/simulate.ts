import { ACTIVITIES, DEFAULT_CONFIG, LISTINGS, MEMBERS, WELCOME_ECO } from '../data/catalog';
import { advanceDay, balance, earn, transfer } from './rules';
import type { Economy, NodeConfig, Tx } from './types';

/** Generador pseudoaleatorio con semilla: la misma historia en cada recarga. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length)];

/**
 * Lo que hace el resto de la comunidad en un día: compras en el marketplace y algo de
 * participación en eventos. `exclude` (quien usa la demo) solo puede recibir, no gastar.
 */
export function communityDay(e: Economy, exclude?: string): Tx[] {
  const r = rng(e.day * 7919 + 17);
  const txs: Tx[] = [];
  const awake = e.members.filter((m) => !m.dormant && m.joinedDay <= e.day);
  const buyers = awake.filter((m) => m.id !== exclude);
  const trades = Math.floor(r() * 3.2);
  for (let i = 0; i < trades && buyers.length; i++) {
    const buyer = pick(r, buyers);
    const options = LISTINGS.filter(
      (l) => l.sellerId !== buyer.id && awake.some((m) => m.id === l.sellerId) && l.price <= balance(buyer),
    );
    if (!options.length) continue;
    const listing = pick(r, options);
    const res = transfer(e, buyer.id, listing.sellerId, listing.price, listing.title, 'compra', listing.category);
    if (res.ok) txs.push(...res.txs);
  }
  if (r() < 0.22 && buyers.length) {
    const who = pick(r, buyers);
    const act = pick(r, ACTIVITIES.filter((a) => !a.once));
    const res = earn(e, who.id, act.reward, act.title, act.category);
    if (res.ok) txs.push(...res.txs);
  }
  return txs;
}

export const HISTORY_DAYS = 80;
export const FERIA_DAYS = [14, 42, 70];

const activity = (id: string) => ACTIVITIES.find((a) => a.id === id)!;

/** Arma la economía de ejemplo corriendo el motor real durante los primeros días del piloto. */
export function createEconomy(config: NodeConfig = DEFAULT_CONFIG): Economy {
  const e: Economy = {
    day: 0,
    config: { ...config },
    members: MEMBERS.map((m) => ({ ...m, lots: [], lastMoveDay: m.joinedDay, lastPenaltyDay: null })),
    fund: 0,
    retired: 0,
    ledger: [],
    nextTxId: 1,
  };
  const intro = activity('mod1');
  const feria = activity('feria');
  const buy = (buyer: string, listingId: string) => {
    const l = LISTINGS.find((x) => x.id === listingId)!;
    transfer(e, buyer, l.sellerId, l.price, l.title, 'compra', l.category);
  };
  // Algunos encargos fijos para que la historia tenga casos que mostrar (p. ej. Julián cerca del tope).
  const scripted: Record<number, () => void> = {
    20: () => buy('rai', 'logo'),
    33: () => buy('tin', 'landing'),
    48: () => buy('and', 'landing'),
    61: () => buy('rai', 'landing'),
    72: () => buy('seb', 'logo'),
    76: () => buy('and', 'logo'),
    78: () => buy('mar', 'stickers'),
  };
  const r = rng(2025);
  while (e.day < HISTORY_DAYS) {
    advanceDay(e);
    for (const m of e.members) {
      if (m.joinedDay === e.day) earn(e, m.id, WELCOME_ECO, 'Bienvenida al nodo');
      if (m.joinedDay === e.day) earn(e, m.id, intro.reward, intro.title, intro.category);
    }
    if (FERIA_DAYS.includes(e.day)) {
      for (const m of e.members) {
        if (!m.dormant && m.joinedDay <= e.day && r() < 0.75) earn(e, m.id, feria.reward, feria.title, feria.category);
      }
    }
    scripted[e.day]?.();
    communityDay(e);
  }
  return e;
}
