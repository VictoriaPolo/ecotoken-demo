import { useEffect, useId, useState } from 'react';
import { Wordmark } from '../site/Header';
import { balance } from '../engine/rules';
import { eco } from '../ui/format';
import { useDemo } from './store';
import { Wallet } from './Wallet';
import { Market } from './Market';
import { Impact } from './Impact';
import { Ledger } from './Ledger';
import { NodePanel } from './NodePanel';

const TABS = [
  { id: 'billetera', label: 'Billetera' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'impacto', label: 'Impacto' },
  { id: 'libro', label: 'Libro mayor' },
  { id: 'nodo', label: 'Nodo' },
] as const;

type Tab = (typeof TABS)[number]['id'];

function TimeBar() {
  const { state, dispatch } = useDemo();
  const id = useId();
  return (
    <div className="timebar">
      <div className="timebar__day">
        <span>Día</span>
        <b>{state.economy.day}</b>
        <span>del piloto</span>
      </div>
      <div className="timebar__actions" role="group" aria-label="Adelantar el tiempo">
        <button onClick={() => dispatch({ type: 'advance', days: 1 })}>+1 día</button>
        <button onClick={() => dispatch({ type: 'advance', days: 7 })}>+1 semana</button>
        <button onClick={() => dispatch({ type: 'advance', days: 30 })}>+1 mes</button>
      </div>
      <label className="toggle" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={state.community}
          onChange={(e) => dispatch({ type: 'community', on: e.target.checked })}
        />
        <span className="toggle__track" aria-hidden="true" />
        La comunidad sigue intercambiando
      </label>
    </div>
  );
}

function Notices() {
  const { state, dispatch } = useDemo();
  if (!state.notices.length && !state.error) {
    return (
      <p className="notices__empty">
        Aquí aparecerá lo que pase: lo que ganes o pagues y cada vez que una regla actúe. Prueba con <b>+1 semana</b>.
      </p>
    );
  }
  return (
    <div className="notices" aria-live="polite">
      {state.error && (
        <p className="notice notice--error" role="alert">
          {state.error}
          <button onClick={() => dispatch({ type: 'dismissError' })} aria-label="Cerrar aviso">
            ×
          </button>
        </p>
      )}
      <ul>
        {state.notices.map((n) => (
          <li key={n.id} className={`notice notice--${n.tone}`}>
            <span className="notice__day">d{n.day}</span>
            <span className="notice__tag">{n.tone === 'regla' ? 'Regla' : n.tone === 'aviso' ? 'Red' : 'Tú'}</span>
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Persona() {
  const { state, dispatch } = useDemo();
  const id = useId();
  return (
    <div className="persona">
      <label htmlFor={id}>Estás usando la demo como</label>
      <select id={id} value={state.me} onChange={(e) => dispatch({ type: 'select', id: e.target.value })}>
        {state.economy.members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} · {eco(balance(m))}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DemoSection() {
  const [tab, setTab] = useState<Tab>('billetera');
  const { state, dispatch } = useDemo();
  const me = state.economy.members.find((m) => m.id === state.me)!;

  useEffect(() => {
    const go = () => {
      const t = location.hash.replace('#demo-', '');
      if (TABS.some((x) => x.id === t)) setTab(t as Tab);
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  return (
    <section className="section demo" id="demo" aria-labelledby="demo-t">
      <header className="section__head section__head--split">
        <div>
          <p className="section__num">04 — Demo</p>
          <h2 id="demo-t">Pruébalo: un día cualquiera en el nodo.</h2>
        </div>
        <ol className="demo__steps">
          <li>
            <span>
              <b>Elige</b> quién eres.
            </span>
          </li>
          <li>
            <span>
              <b>Gana, compra o transfiere</b> ECO.
            </span>
          </li>
          <li>
            <span>
              <b>Adelanta el tiempo</b> y mira actuar las reglas.
            </span>
          </li>
        </ol>
      </header>

      <div className="app">
        <div className="app__top">
          <Wordmark />
          <div className="app__tabs" role="tablist" aria-label="Módulos de la plataforma">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`pane-${t.id}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="app__hello">
            Hola, <b>{me.name.split(' ')[0]}</b>
          </p>
        </div>
        <div className="app__controls">
          <Persona />
          <TimeBar />
        </div>
        <div className="app__body">
          <div className="app__pane" role="tabpanel" id={`pane-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'billetera' && <Wallet onGoMarket={() => setTab('marketplace')} />}
            {tab === 'marketplace' && <Market />}
            {tab === 'impacto' && <Impact />}
            {tab === 'libro' && <Ledger />}
            {tab === 'nodo' && <NodePanel />}
          </div>
          <aside className="app__feed" aria-label="Lo que va pasando">
            <div className="app__feedinner">
              <h3>Lo que va pasando</h3>
              <Notices />
              <button className="linkbtn" onClick={() => dispatch({ type: 'reset' })}>
                Reiniciar la demo
              </button>
            </div>
          </aside>
        </div>
      </div>
      <p className="footnote">
        Todo corre en tu navegador con personas y datos de ejemplo; no hay dinero real ni servidor. El motor aplica las
        mismas reglas descritas arriba y guarda tu partida en este navegador.
      </p>
    </section>
  );
}
