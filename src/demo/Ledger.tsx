import { useId, useState } from 'react';
import type { TxKind } from '../engine/types';
import { num } from '../ui/format';
import { nameOf, useDemo } from './store';

const KIND_LABEL: Record<TxKind, string> = {
  emision: 'Emisión',
  compra: 'Compra',
  transferencia: 'Transferencia',
  excedente: 'Excedente',
  caducidad: 'Caducidad',
  inactividad: 'Inactividad',
};

const GROUPS = {
  todo: () => true,
  intercambios: (k: TxKind) => k === 'compra' || k === 'transferencia',
  reglas: (k: TxKind) => k === 'excedente' || k === 'caducidad' || k === 'inactividad',
  emision: (k: TxKind) => k === 'emision',
} as const;

type Group = keyof typeof GROUPS;

const PAGE = 30;

export function Ledger() {
  const { state } = useDemo();
  const e = state.economy;
  const [group, setGroup] = useState<Group>('todo');
  const [onlyMe, setOnlyMe] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const id = useId();
  const rows = e.ledger
    .filter((t) => GROUPS[group](t.kind))
    .filter((t) => !onlyMe || t.from === state.me || t.to === state.me)
    .slice()
    .reverse();

  return (
    <div className="ledger">
      <div className="ledger__head">
        <h3>Libro mayor</h3>
        <p className="muted">
          Cada movimiento queda registrado con su día, origen, destino y concepto. En el prototipo esto vive en
          PostgreSQL; aquí, en la memoria de tu navegador.
        </p>
        <div className="ledger__filters">
          <div className="chips" role="radiogroup" aria-label="Tipo de movimiento">
            {(Object.keys(GROUPS) as Group[]).map((g) => (
              <button key={g} role="radio" aria-checked={group === g} onClick={() => setGroup(g)}>
                {g === 'todo' ? 'Todo' : g === 'intercambios' ? 'Intercambios' : g === 'reglas' ? 'Reglas' : 'Emisión'}
              </button>
            ))}
          </div>
          <label className="check" htmlFor={id}>
            <input id={id} type="checkbox" checked={onlyMe} onChange={(ev) => setOnlyMe(ev.target.checked)} />
            Solo mis movimientos
          </label>
        </div>
      </div>
      <div className="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">N.º</th>
              <th scope="col">Día</th>
              <th scope="col">Tipo</th>
              <th scope="col">De</th>
              <th scope="col">Para</th>
              <th scope="col">Concepto</th>
              <th scope="col" className="num">
                ECO
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, shown).map((t) => (
              <tr key={t.id} className={`k-${t.kind}`}>
                <td className="mono">{String(t.id).padStart(5, '0')}</td>
                <td className="mono">{t.day}</td>
                <td>
                  <span className="kind">{KIND_LABEL[t.kind]}</span>
                </td>
                <td>{nameOf(e, t.from, state.me)}</td>
                <td>{nameOf(e, t.to, state.me)}</td>
                <td className="concept">{t.concept}</td>
                <td className="num mono">{num(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ledger__foot">
        {rows.length > shown ? (
          <button className="linkbtn" onClick={() => setShown((s) => s + PAGE)}>
            Ver {Math.min(PAGE, rows.length - shown)} más ({rows.length - shown} restantes)
          </button>
        ) : (
          <span className="muted">{rows.length} movimientos</span>
        )}
      </p>
    </div>
  );
}
