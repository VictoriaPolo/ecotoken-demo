import { useId, useState, type FormEvent } from 'react';
import { ACTIVITIES } from '../data/catalog';
import { balance, nextExpiry } from '../engine/rules';
import type { Tx } from '../engine/types';
import { eco, num } from '../ui/format';
import { nameOf, useDemo } from './store';

export function TxLine({ tx, me }: { tx: Tx; me: string }) {
  const { state } = useDemo();
  const e = state.economy;
  const out = tx.from === me;
  const sign = out ? '−' : '+';
  const who = out ? nameOf(e, tx.to, me) : nameOf(e, tx.from, me);
  return (
    <li className={`txline txline--${tx.kind}`}>
      <span className="txline__day">d{tx.day}</span>
      <span className="txline__what">
        {tx.concept}
        <small>
          {out ? 'a' : 'de'} {who}
        </small>
      </span>
      <span className={`txline__amt ${out ? 'is-out' : 'is-in'}`}>
        {sign}
        {num(tx.amount)}
      </span>
    </li>
  );
}

function TransferForm({ onDone }: { onDone: () => void }) {
  const { state, dispatch } = useDemo();
  const others = state.economy.members.filter((m) => m.id !== state.me);
  const [to, setTo] = useState(others[0]?.id ?? '');
  const [amount, setAmount] = useState('20');
  const [concept, setConcept] = useState('');
  const ids = { to: useId(), amount: useId(), concept: useId() };
  const target = others.find((m) => m.id === to);
  const room = target ? state.economy.config.walletCap - balance(target) : 0;
  const n = Number(amount);

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const mine = balance(state.economy.members.find((m) => m.id === state.me)!);
    dispatch({ type: 'transfer', to, amount: n, concept: concept.trim() });
    // Si no es válida, el reductor muestra el error y el formulario sigue abierto para corregir.
    if (Number.isInteger(n) && n > 0 && n <= mine) onDone();
  }

  return (
    <form className="transfer" onSubmit={submit}>
      <div className="field">
        <label htmlFor={ids.to}>Para</label>
        <select id={ids.to} value={to} onChange={(e) => setTo(e.target.value)}>
          {others.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field field--amt">
        <label htmlFor={ids.amount}>ECO</label>
        <input
          id={ids.amount}
          inputMode="numeric"
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="field field--wide">
        <label htmlFor={ids.concept}>Concepto</label>
        <input
          id={ids.concept}
          value={concept}
          maxLength={60}
          placeholder="Ej.: gracias por la tutoría"
          onChange={(e) => setConcept(e.target.value)}
        />
      </div>
      {target && n > room && (
        <p className="transfer__hint">
          {target.name.split(' ')[0]} solo tiene espacio para {eco(Math.max(0, room))}: el resto irá al fondo
          comunitario.
        </p>
      )}
      <button className="btn btn--lime" type="submit">
        Enviar ECO
      </button>
    </form>
  );
}

export function Wallet({ onGoMarket }: { onGoMarket: () => void }) {
  const { state, dispatch } = useDemo();
  const [sending, setSending] = useState(false);
  const e = state.economy;
  const me = e.members.find((m) => m.id === state.me)!;
  const bal = balance(me);
  const cap = e.config.walletCap;
  const since = e.day - 30;
  const mine = e.ledger.filter((t) => t.from === me.id || t.to === me.id);
  const received = mine
    .filter((t) => t.to === me.id && t.day > since)
    .reduce((s, t) => s + t.amount, 0);
  const spent = mine
    .filter((t) => t.from === me.id && t.day > since && (t.kind === 'compra' || t.kind === 'transferencia'))
    .reduce((s, t) => s + t.amount, 0);
  const next = nextExpiry(me);
  const idle = e.day - me.lastMoveDay;
  const lots = [...me.lots].sort((a, b) => a.expiresDay - b.expiresDay);
  const done = new Set(mine.filter((t) => t.kind === 'emision').map((t) => t.concept));

  return (
    <div className="wallet">
      <div className="wallet__card">
        <p className="wallet__label">Mi billetera</p>
        <p className="wallet__balance">
          {num(bal)}
          <span>ECO</span>
        </p>
        <div className="capbar" aria-label={`${bal} de ${cap} ECO de tope`}>
          <div className="capbar__fill" style={{ width: `${Math.min(100, (bal / cap) * 100)}%` }} />
        </div>
        <p className="wallet__cap">
          Tope máximo: {eco(cap)} · {bal >= cap ? 'estás en el tope' : `te caben ${eco(cap - bal)}`}
        </p>
        <dl className="wallet__stats">
          <div>
            <dt>recibidos · 30 d</dt>
            <dd>+{num(received)}</dd>
          </div>
          <div>
            <dt>gastados · 30 d</dt>
            <dd>−{num(spent)}</dd>
          </div>
          <div>
            <dt>próximo vencimiento</dt>
            <dd>{next ? `${next.day - e.day} d` : '—'}</dd>
          </div>
        </dl>
        <p className={`wallet__idle ${idle > e.config.inactivityDays - 10 ? 'is-warn' : ''}`}>
          {idle === 0
            ? 'Te moviste hoy.'
            : `Último movimiento hace ${idle} ${idle === 1 ? 'día' : 'días'}.`}{' '}
          {idle > e.config.inactivityDays
            ? `Pasaste los ${e.config.inactivityDays} días: pierdes ${e.config.penaltyPct} % al mes.`
            : `La penalización empieza pasados ${e.config.inactivityDays}.`}
        </p>
        <div className="wallet__actions">
          <button className="btn btn--lime" aria-expanded={sending} onClick={() => setSending((v) => !v)}>
            {sending ? 'Cerrar' : 'Transferir ECO'}
          </button>
          <button className="btn btn--ghost" onClick={onGoMarket}>
            Ir al marketplace
          </button>
        </div>
        {sending && <TransferForm onDone={() => setSending(false)} />}
      </div>

      <div className="wallet__side">
        <section className="panel">
          <h3>
            Tus lotes <small>se gastan primero los que vencen antes</small>
          </h3>
          {lots.length ? (
            <ul className="lots">
              {lots.map((l, i) => {
                const left = l.expiresDay - e.day;
                const life = Math.max(0, Math.min(1, left / e.config.expiryDays));
                return (
                  <li key={`${l.issuedDay}-${i}`} className={left <= 14 ? 'is-soon' : ''}>
                    <span className="lots__amt">{num(l.amount)} ECO</span>
                    <span className="lots__bar" aria-hidden="true">
                      <span style={{ width: `${life * 100}%` }} />
                    </span>
                    <span className="lots__left">
                      {left <= 0 ? 'hoy' : `${left} d`}
                      <small>recibido d{l.issuedDay}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Billetera vacía. Gana ECO participando o vendiendo algo.</p>
          )}
        </section>

        <section className="panel">
          <h3>
            Ganar ECO <small>emisión del nodo</small>
          </h3>
          <ul className="earn">
            {ACTIVITIES.map((a) => {
              const used = a.once && done.has(a.title);
              return (
                <li key={a.id}>
                  <span>
                    {a.title}
                    <small>{a.detail}</small>
                  </span>
                  <button
                    className="pill"
                    disabled={used}
                    onClick={() => dispatch({ type: 'earn', activityId: a.id })}
                    aria-label={`${a.title}: ganar ${a.reward} ECO`}
                  >
                    {used ? 'Hecho' : `+${a.reward}`}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel">
          <h3>
            Últimos movimientos <small>{mine.length} en total</small>
          </h3>
          <ul className="txlist">
            {mine
              .slice(-6)
              .reverse()
              .map((t) => (
                <TxLine key={t.id} tx={t} me={me.id} />
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
