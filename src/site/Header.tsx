import { useState } from 'react';
import { useDemo } from '../demo/store';
import { eco } from '../ui/format';

export const SECTIONS = [
  { id: 'problema', n: '01', label: 'Problema' },
  { id: 'ciclo', n: '02', label: 'Ciclo' },
  { id: 'reglas', n: '03', label: 'Reglas' },
  { id: 'demo', n: '04', label: 'Demo' },
  { id: 'metodo', n: '05', label: 'Método' },
  { id: 'nodos', n: '06', label: 'Nodos' },
  { id: 'equipo', n: '07', label: 'Equipo' },
];

export function Wordmark() {
  return (
    <span className="wordmark">
      <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="var(--forest)" />
        <circle cx="32" cy="32" r="24" fill="none" stroke="var(--lime)" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M40 22H26v20h14M26 32h11" fill="none" stroke="var(--lime)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        Eco<b>Token</b>
      </span>
    </span>
  );
}

function Ticker() {
  const { state, metrics } = useDemo();
  const items = [
    'Nodo 001 · UCC Campus Bogotá',
    `Día ${state.economy.day} del piloto simulado`,
    `${eco(metrics.circulating)} en circulación`,
    `Fondo comunitario ${eco(state.economy.fund)}`,
    `${metrics.exchanges} intercambios registrados`,
    `Tope ${eco(state.economy.config.walletCap)} · caducidad ${state.economy.config.expiryDays} días`,
    'Datos de ejemplo',
  ];
  const line = items.map((t) => (
    <span key={t}>
      {t}
      <i aria-hidden="true">◆</i>
    </span>
  ));
  return (
    <div className="ticker" aria-label="Estado de la simulación">
      <div className="ticker__track">
        <div className="ticker__run">{line}</div>
        <div className="ticker__run" aria-hidden="true">
          {line}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="header__bar">
        <a href="#top" className="header__brand" aria-label="EcoToken, inicio">
          <Wordmark />
        </a>
        <button
          className="header__toggle"
          aria-expanded={open}
          aria-controls="indice"
          onClick={() => setOpen((v) => !v)}
        >
          Índice <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        <nav id="indice" className={`header__nav ${open ? 'is-open' : ''}`} aria-label="Secciones">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={() => setOpen(false)}>
              <small>{s.n}</small>
              {s.label}
            </a>
          ))}
        </nav>
        <a href="#demo" className="ticket-btn">
          Probar la demo
        </a>
      </div>
      <Ticker />
    </header>
  );
}
