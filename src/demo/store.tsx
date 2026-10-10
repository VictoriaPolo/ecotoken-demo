import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { ACTIVITIES, LISTINGS } from '../data/catalog';
import { computeMetrics, type Metrics } from '../engine/metrics';
import { advanceDay, earn, transfer, type Result } from '../engine/rules';
import { communityDay, createEconomy } from '../engine/simulate';
import { FUND, NODE, RETIRED, type Economy, type NodeConfig, type Notice, type Tx } from '../engine/types';

interface DemoState {
  economy: Economy;
  me: string;
  community: boolean;
  notices: Notice[];
  error: string | null;
  noticeSeq: number;
}

type Action =
  | { type: 'select'; id: string }
  | { type: 'buy'; listingId: string }
  | { type: 'earn'; activityId: string }
  | { type: 'transfer'; to: string; amount: number; concept: string }
  | { type: 'advance'; days: number }
  | { type: 'config'; patch: Partial<NodeConfig> }
  | { type: 'community'; on: boolean }
  | { type: 'dismissError' }
  | { type: 'reset' };

const STORAGE_KEY = 'ecotoken-demo:v1';
const MAX_NOTICES = 8;

export function nameOf(e: Economy, id: string, me?: string): string {
  if (id === me) return 'Tú';
  if (id === NODE) return 'El nodo';
  if (id === FUND) return 'Fondo comunitario';
  if (id === RETIRED) return 'Fuera de circulación';
  return e.members.find((m) => m.id === id)?.name ?? id;
}

/** Nombre corto para los avisos: el nombre de pila de una persona, o el de la organización completo. */
const firstName = (e: Economy, id: string, me: string) => {
  const org = e.members.find((m) => m.id === id)?.role === 'organizacion';
  const name = nameOf(e, id, me);
  return org ? name : name.split(' ')[0];
};

/** Convierte movimientos del libro mayor en avisos legibles para quien usa la demo. */
function toneOf(tx: Tx, me: string): Notice['tone'] | null {
  if (tx.kind === 'caducidad' || tx.kind === 'inactividad' || tx.kind === 'excedente') return 'regla';
  if ((tx.kind === 'compra' || tx.kind === 'transferencia') && (tx.to === me || tx.from === me)) return 'intercambio';
  if (tx.kind === 'emision' && tx.to === me) return 'intercambio';
  return null;
}

function noticeText(e: Economy, tx: Tx, me: string): string {
  const from = firstName(e, tx.from, me);
  const to = firstName(e, tx.to, me);
  const dest = tx.to === FUND ? 'al fondo comunitario' : 'fuera de circulación';
  switch (tx.kind) {
    case 'caducidad':
      return `Caducaron ${tx.amount} ECO de ${from === 'Tú' ? 'tu billetera' : from}: pasan ${dest}.`;
    case 'inactividad':
      return `${from === 'Tú' ? 'Tu billetera' : from} lleva más de ${e.config.inactivityDays} días quieta: −${tx.amount} ECO ${dest}.`;
    case 'excedente':
      return `${from === 'Tú' ? 'Llegaste' : `${from} llegó`} al tope de ${e.config.walletCap} ECO: ${tx.amount} ECO pasan al fondo comunitario.`;
    case 'emision':
      return `Ganaste ${tx.amount} ECO: ${tx.concept}.`;
    case 'compra':
      return tx.from === me ? `Pagaste ${tx.amount} ECO a ${to}: ${tx.concept}.` : `${from} te compró «${tx.concept}»: +${tx.amount} ECO.`;
    case 'transferencia':
      return tx.from === me ? `Enviaste ${tx.amount} ECO a ${to}.` : `${from} te envió ${tx.amount} ECO.`;
  }
}

function withNotices(state: DemoState, economy: Economy, txs: Tx[], extra: Notice[] = []): DemoState {
  let seq = state.noticeSeq;
  const fresh: Notice[] = [];
  for (const tx of txs) {
    const tone = toneOf(tx, state.me);
    if (tone) fresh.push({ id: ++seq, day: tx.day, tone, text: noticeText(economy, tx, state.me) });
  }
  for (const n of extra) fresh.push({ ...n, id: ++seq });
  return {
    ...state,
    economy,
    error: null,
    noticeSeq: seq,
    notices: [...fresh.reverse(), ...state.notices].slice(0, MAX_NOTICES),
  };
}

function applyResult(state: DemoState, economy: Economy, res: Result): DemoState {
  if (!res.ok) return { ...state, error: res.error };
  return withNotices(state, economy, res.txs);
}

function initial(): DemoState {
  return { economy: createEconomy(), me: 'val', community: true, notices: [], error: null, noticeSeq: 0 };
}

function reducer(state: DemoState, action: Action): DemoState {
  const e = structuredClone(state.economy);
  switch (action.type) {
    case 'select':
      return { ...state, me: action.id, notices: [], error: null };
    case 'buy': {
      const l = LISTINGS.find((x) => x.id === action.listingId);
      if (!l) return state;
      return applyResult(state, e, transfer(e, state.me, l.sellerId, l.price, l.title, 'compra', l.category));
    }
    case 'earn': {
      const a = ACTIVITIES.find((x) => x.id === action.activityId);
      if (!a) return state;
      if (a.once && e.ledger.some((t) => t.kind === 'emision' && t.to === state.me && t.concept === a.title)) {
        return { ...state, error: 'Ese módulo ya lo completaste: solo da ECO una vez.' };
      }
      return applyResult(state, e, earn(e, state.me, a.reward, a.title, a.category));
    }
    case 'transfer':
      return applyResult(state, e, transfer(e, state.me, action.to, action.amount, action.concept || 'Transferencia'));
    case 'advance': {
      const txs: Tx[] = [];
      for (let i = 0; i < action.days; i++) {
        txs.push(...advanceDay(e));
        if (state.community) txs.push(...communityDay(e, state.me));
      }
      const others = txs.filter((t) => (t.kind === 'compra' || t.kind === 'transferencia') && t.from !== state.me && t.to !== state.me);
      const extra: Notice[] = others.length
        ? [{ id: 0, day: e.day, tone: 'aviso', text: `La comunidad hizo ${others.length} intercambios entre el día ${state.economy.day + 1} y el ${e.day}.` }]
        : [];
      return withNotices(state, e, txs, extra);
    }
    case 'config':
      e.config = { ...e.config, ...action.patch };
      return { ...state, economy: e };
    case 'community':
      return { ...state, community: action.on };
    case 'dismissError':
      return { ...state, error: null };
    case 'reset':
      return initial();
  }
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.economy?.members?.length && typeof saved.me === 'string') {
        return { ...initial(), economy: saved.economy, me: saved.me, community: saved.community !== false };
      }
    }
  } catch {
    /* sin almacenamiento disponible: se arranca con la historia de ejemplo */
  }
  return initial();
}

interface DemoContext {
  state: DemoState;
  metrics: Metrics;
  dispatch: (a: Action) => void;
}

const Ctx = createContext<DemoContext | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ economy: state.economy, me: state.me, community: state.community }));
    } catch {
      /* el modo privado puede bloquear el almacenamiento; la demo sigue funcionando */
    }
  }, [state.economy, state.me, state.community]);
  const metrics = useMemo(() => computeMetrics(state.economy), [state.economy]);
  const value = useMemo(() => ({ state, metrics, dispatch }), [state, metrics]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo(): DemoContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDemo fuera de DemoProvider');
  return ctx;
}
