import { describe, expect, it } from 'vitest';
import { advanceDay, balance, earn, findMember, penaltyCanTrigger, transfer } from './rules';
import { computeMetrics } from './metrics';
import { createEconomy } from './simulate';
import type { Economy, NodeConfig } from './types';

const config: NodeConfig = { expiryDays: 90, walletCap: 500, inactivityDays: 60, penaltyPct: 10, retainedTo: 'fondo' };

function economy(overrides: Partial<NodeConfig> = {}): Economy {
  const base = { lastMoveDay: 0, lastPenaltyDay: null, joinedDay: 0, occupation: '', role: 'estudiante' as const };
  return {
    day: 0,
    config: { ...config, ...overrides },
    members: [
      { ...base, lots: [], id: 'a', name: 'A', initials: 'A' },
      { ...base, lots: [], id: 'b', name: 'B', initials: 'B' },
    ],
    fund: 0,
    retired: 0,
    ledger: [],
    nextTxId: 1,
  };
}

const days = (e: Economy, n: number) => {
  for (let i = 0; i < n; i++) advanceDay(e);
};

describe('tope de billetera', () => {
  it('manda al fondo comunitario lo que pasa de 500 ECO', () => {
    const e = economy();
    earn(e, 'a', 450, 'x');
    const res = earn(e, 'a', 80, 'y');
    expect(res.ok).toBe(true);
    expect(balance(findMember(e, 'a'))).toBe(500);
    expect(e.fund).toBe(30);
    expect(e.ledger.at(-1)).toMatchObject({ kind: 'excedente', amount: 30, to: 'fondo' });
  });

  it('aplica el tope también a lo que llega por una compra', () => {
    const e = economy();
    earn(e, 'a', 490, 'x');
    earn(e, 'b', 100, 'y');
    transfer(e, 'b', 'a', 40, 'Tutoría', 'compra');
    expect(balance(findMember(e, 'a'))).toBe(500);
    expect(balance(findMember(e, 'b'))).toBe(60);
    expect(e.fund).toBe(30);
  });
});

describe('caducidad', () => {
  it('vence los ECO que no se usan en el plazo del nodo', () => {
    const e = economy({ expiryDays: 30 });
    earn(e, 'a', 100, 'x');
    days(e, 29);
    expect(balance(findMember(e, 'a'))).toBe(100);
    days(e, 1);
    expect(balance(findMember(e, 'a'))).toBe(0);
    expect(e.fund).toBe(100);
  });

  it('gasta primero los ECO que vencen antes', () => {
    const e = economy({ expiryDays: 30 });
    earn(e, 'a', 50, 'viejo');
    days(e, 20);
    earn(e, 'a', 50, 'nuevo');
    transfer(e, 'a', 'b', 50, 'pago');
    days(e, 10);
    // Lo viejo ya se gastó, así que al día 30 no vence nada.
    expect(balance(findMember(e, 'a'))).toBe(50);
    expect(e.fund).toBe(0);
  });

  it('puede retirar de circulación en vez de ir al fondo', () => {
    const e = economy({ expiryDays: 30, retainedTo: 'retiro' });
    earn(e, 'a', 40, 'x');
    days(e, 30);
    expect(e.fund).toBe(0);
    expect(e.retired).toBe(40);
  });
});

describe('penalización por inactividad', () => {
  it('quita el 10 % pasados 60 días sin movimientos y luego cada mes', () => {
    const e = economy();
    earn(e, 'a', 200, 'x');
    days(e, 60);
    expect(balance(findMember(e, 'a'))).toBe(200);
    days(e, 1);
    expect(balance(findMember(e, 'a'))).toBe(180);
    days(e, 28);
    expect(balance(findMember(e, 'a'))).toBe(180);
    // Día 90: vence el lote antes de la segunda penalización.
    days(e, 1);
    expect(balance(findMember(e, 'a'))).toBe(0);
    expect(e.ledger.filter((t) => t.kind === 'inactividad')).toHaveLength(1);
  });

  it('se reinicia con cualquier movimiento', () => {
    const e = economy();
    earn(e, 'a', 200, 'x');
    days(e, 59);
    transfer(e, 'a', 'b', 10, 'pago');
    days(e, 60);
    expect(e.ledger.some((t) => t.kind === 'inactividad')).toBe(false);
  });

  it('no llega a aplicarse si la caducidad es más corta que el umbral', () => {
    expect(penaltyCanTrigger({ expiryDays: 60, inactivityDays: 60 })).toBe(false);
    expect(penaltyCanTrigger({ expiryDays: 90, inactivityDays: 60 })).toBe(true);
    const e = economy({ expiryDays: 60 });
    earn(e, 'a', 200, 'x');
    days(e, 120);
    expect(e.ledger.some((t) => t.kind === 'inactividad')).toBe(false);
  });
});

describe('transferencias', () => {
  it('rechaza saldo insuficiente, montos no válidos y envíos a uno mismo', () => {
    const e = economy();
    earn(e, 'a', 20, 'x');
    expect(transfer(e, 'a', 'b', 30, 'x').ok).toBe(false);
    expect(transfer(e, 'a', 'b', 0, 'x').ok).toBe(false);
    expect(transfer(e, 'a', 'b', 2.5, 'x').ok).toBe(false);
    expect(transfer(e, 'a', 'a', 5, 'x').ok).toBe(false);
    expect(balance(findMember(e, 'a'))).toBe(20);
  });
});

describe('economía de ejemplo', () => {
  it('cuadra: lo emitido es igual a saldos + fondo + retirado', () => {
    const e = createEconomy();
    const m = computeMetrics(e);
    expect(m.emitted).toBe(m.circulating + e.fund + e.retired);
    expect(m.exchanges).toBeGreaterThan(40);
    for (const member of e.members) expect(balance(member)).toBeLessThanOrEqual(e.config.walletCap);
  });

  it('es determinista', () => {
    expect(createEconomy().ledger).toEqual(createEconomy().ledger);
  });
});
