import {
  FUND,
  NODE,
  RETIRED,
  type Category,
  type Economy,
  type Member,
  type Tx,
  type TxKind,
} from './types';

/** Intervalo entre penalizaciones una vez superado el umbral: "10 % mensual". */
export const PENALTY_PERIOD_DAYS = 30;

export type Result = { ok: true; txs: Tx[] } | { ok: false; error: string };

export function balance(m: Member): number {
  return m.lots.reduce((sum, lot) => sum + lot.amount, 0);
}

export function findMember(e: Economy, id: string): Member {
  const m = e.members.find((x) => x.id === id);
  if (!m) throw new Error(`Miembro desconocido: ${id}`);
  return m;
}

export function nextExpiry(m: Member): { amount: number; day: number } | null {
  if (!m.lots.length) return null;
  const day = Math.min(...m.lots.map((l) => l.expiresDay));
  const amount = m.lots.filter((l) => l.expiresDay === day).reduce((s, l) => s + l.amount, 0);
  return { amount, day };
}

function record(e: Economy, tx: Omit<Tx, 'id' | 'day'>): Tx {
  const full: Tx = { ...tx, id: e.nextTxId++, day: e.day };
  e.ledger.push(full);
  return full;
}

/** Se gastan primero los ECO que vencen antes, para que no se pierdan. */
function debit(m: Member, amount: number): void {
  m.lots.sort((a, b) => a.expiresDay - b.expiresDay);
  let rest = amount;
  for (const lot of m.lots) {
    const take = Math.min(lot.amount, rest);
    lot.amount -= take;
    rest -= take;
    if (rest === 0) break;
  }
  m.lots = m.lots.filter((l) => l.amount > 0);
}

function retain(e: Economy, amount: number): string {
  if (e.config.retainedTo === 'fondo') {
    e.fund += amount;
    return FUND;
  }
  e.retired += amount;
  return RETIRED;
}

/**
 * Abona ECO respetando el tope de billetera: lo que no cabe pasa al fondo comunitario
 * y queda como un movimiento aparte en el libro mayor.
 */
function credit(
  e: Economy,
  to: Member,
  amount: number,
  from: string,
  kind: TxKind,
  concept: string,
  category?: Category,
): Tx[] {
  const room = Math.max(0, e.config.walletCap - balance(to));
  const kept = Math.min(room, amount);
  const overflow = amount - kept;
  if (kept > 0) {
    to.lots.push({ amount: kept, issuedDay: e.day, expiresDay: e.day + e.config.expiryDays });
  }
  to.lastMoveDay = e.day;
  to.lastPenaltyDay = null;
  const txs = [record(e, { kind, from, to: to.id, amount, concept, category })];
  if (overflow > 0) {
    e.fund += overflow;
    txs.push(
      record(e, {
        kind: 'excedente',
        from: to.id,
        to: FUND,
        amount: overflow,
        concept: `Excedente sobre el tope de ${e.config.walletCap} ECO`,
      }),
    );
  }
  return txs;
}

/** Emisión del nodo: lo que se gana participando (ferias, formación, vincular miembros). */
export function earn(
  e: Economy,
  memberId: string,
  amount: number,
  concept: string,
  category?: Category,
): Result {
  if (!(amount > 0)) return { ok: false, error: 'La cantidad debe ser mayor que cero.' };
  const m = findMember(e, memberId);
  return { ok: true, txs: credit(e, m, amount, NODE, 'emision', concept, category) };
}

export function transfer(
  e: Economy,
  fromId: string,
  toId: string,
  amount: number,
  concept: string,
  kind: 'compra' | 'transferencia' = 'transferencia',
  category?: Category,
): Result {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, error: 'Escribe una cantidad entera de ECO mayor que cero.' };
  }
  if (fromId === toId) return { ok: false, error: 'No puedes enviarte ECO a ti mismo.' };
  const from = findMember(e, fromId);
  const to = findMember(e, toId);
  const available = balance(from);
  if (available < amount) {
    return { ok: false, error: `Saldo insuficiente: tienes ${available} ECO y necesitas ${amount}.` };
  }
  debit(from, amount);
  from.lastMoveDay = e.day;
  from.lastPenaltyDay = null;
  return { ok: true, txs: credit(e, to, amount, from.id, kind, concept, category) };
}

/** Avanza un día y aplica caducidad y penalización por inactividad a cada billetera. */
export function advanceDay(e: Economy): Tx[] {
  e.day += 1;
  const txs: Tx[] = [];
  const { expiryDays, inactivityDays, penaltyPct } = e.config;
  for (const m of e.members) {
    const expired = m.lots.filter((l) => l.expiresDay <= e.day).reduce((s, l) => s + l.amount, 0);
    if (expired > 0) {
      m.lots = m.lots.filter((l) => l.expiresDay > e.day);
      const to = retain(e, expired);
      txs.push(
        record(e, {
          kind: 'caducidad',
          from: m.id,
          to,
          amount: expired,
          concept: `ECO sin usar durante ${expiryDays} días`,
        }),
      );
    }

    const idle = e.day - m.lastMoveDay;
    const due =
      m.lastPenaltyDay === null ? idle > inactivityDays : e.day - m.lastPenaltyDay >= PENALTY_PERIOD_DAYS;
    const bal = balance(m);
    if (idle > inactivityDays && due && bal > 0) {
      const penalty = Math.max(1, Math.round((bal * penaltyPct) / 100));
      debit(m, penalty);
      m.lastPenaltyDay = e.day;
      const to = retain(e, penalty);
      txs.push(
        record(e, {
          kind: 'inactividad',
          from: m.id,
          to,
          amount: penalty,
          concept: `${penaltyPct} % por ${idle} días sin movimientos`,
        }),
      );
    }
  }
  return txs;
}

/**
 * Con la caducidad igual o más corta que el umbral de inactividad, los ECO de una
 * billetera quieta vencen antes de que la penalización llegue a aplicarse.
 */
export function penaltyCanTrigger(config: { expiryDays: number; inactivityDays: number }): boolean {
  return config.expiryDays > config.inactivityDays + 1;
}
