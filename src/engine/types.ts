export type Role = 'estudiante' | 'organizacion';

export type Category = 'servicio' | 'producto' | 'evento' | 'formacion' | 'canje';

/** Un lote de ECO recibido en un mismo momento: caduca entero en `expiresDay`. */
export interface Lot {
  amount: number;
  issuedDay: number;
  expiresDay: number;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  role: Role;
  occupation: string;
  lots: Lot[];
  joinedDay: number;
  /** Último día con un movimiento propio (enviar o recibir). Las reglas no cuentan. */
  lastMoveDay: number;
  /** Último día en que se le aplicó la penalización por inactividad. */
  lastPenaltyDay: number | null;
  /** Miembro que la simulación de fondo deja quieto, para que se vea la penalización. */
  dormant?: boolean;
}

/** Parámetros que cada universidad fija en su propio nodo. */
export interface NodeConfig {
  expiryDays: number;
  walletCap: number;
  inactivityDays: number;
  penaltyPct: number;
  /** A dónde va lo que caduca o se penaliza: aún por definir en la gobernanza del nodo. */
  retainedTo: 'fondo' | 'retiro';
}

export type TxKind =
  | 'emision'
  | 'compra'
  | 'transferencia'
  | 'excedente'
  | 'caducidad'
  | 'inactividad';

export interface Tx {
  id: number;
  day: number;
  kind: TxKind;
  from: string;
  to: string;
  amount: number;
  concept: string;
  category?: Category;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  detail: string;
  price: number;
  category: Category;
  icon: string;
}

export interface Activity {
  id: string;
  title: string;
  detail: string;
  reward: number;
  category: Category;
  once?: boolean;
}

export interface Notice {
  id: number;
  day: number;
  tone: 'regla' | 'intercambio' | 'aviso';
  text: string;
}

export interface Economy {
  day: number;
  config: NodeConfig;
  members: Member[];
  fund: number;
  retired: number;
  ledger: Tx[];
  nextTxId: number;
}

export const NODE = 'nodo';
export const FUND = 'fondo';
export const RETIRED = 'retiro';
