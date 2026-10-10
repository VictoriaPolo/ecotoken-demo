import { useId, useState, type ReactNode } from 'react';
import { Stamp } from '../ui/Stamp';
import { eco } from '../ui/format';

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="slider">
      <label htmlFor={id}>
        {props.label}
        <output htmlFor={id}>
          {props.value} {props.unit}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ ['--fill' as string]: `${((props.value - props.min) / (props.max - props.min)) * 100}%` }}
      />
    </div>
  );
}

function ExpirySim() {
  const [expiry, setExpiry] = useState(60);
  const [days, setDays] = useState(40);
  const span = 120;
  const expired = days >= expiry;
  return (
    <div className="sim">
      <div className="chips" role="radiogroup" aria-label="Caducidad del nodo">
        {[30, 60, 90].map((d) => (
          <button key={d} role="radio" aria-checked={expiry === d} onClick={() => setExpiry(d)}>
            Nodo a {d} días
          </button>
        ))}
      </div>
      <svg viewBox="0 0 320 92" className="sim__svg" aria-hidden="true">
        <rect x="0" y="34" width={(expiry / span) * 320} height="22" className="band band--ok" />
        <rect x={(expiry / span) * 320} y="34" width={320 - (expiry / span) * 320} height="22" className="band band--off" />
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i} transform={`translate(${(i * 10 * 320) / span} 0)`}>
            <line y1="60" y2={i % 3 === 0 ? 68 : 64} className="tick" />
            {i % 3 === 0 && (
              <text y="82" textAnchor={i === 0 ? 'start' : i === 12 ? 'end' : 'middle'} className="axis">
                {i * 10}
              </text>
            )}
          </g>
        ))}
        <g transform={`translate(${(days / span) * 320} 0)`} className="marker">
          <line y1="24" y2="60" />
          <circle cy="20" r="5" />
        </g>
      </svg>
      <p className={`sim__readout ${expired ? 'is-bad' : ''}`}>
        {expired ? (
          <>
            <b>0 ECO</b> en la billetera: los 100 ECO caducaron el día {expiry}.
          </>
        ) : (
          <>
            <b>100 ECO</b> vigentes · caducan en {expiry - days} días.
          </>
        )}
      </p>
      <Slider label="Días sin usar 100 ECO" value={days} min={0} max={span} unit="días" onChange={setDays} />
    </div>
  );
}

function CapSim() {
  const [incoming, setIncoming] = useState(620);
  const cap = 500;
  const kept = Math.min(cap, incoming);
  const overflow = Math.max(0, incoming - cap);
  const h = 120;
  return (
    <div className="sim">
      <svg viewBox="0 0 320 168" className="sim__svg" aria-hidden="true">
        <g transform="translate(36 12)">
          <path d={`M0 0v${h}a8 8 0 0 0 8 8h84a8 8 0 0 0 8-8V0`} className="vessel" />
          <rect x="4" y={h - (kept / 800) * h} width="92" height={(kept / 800) * h} rx="4" className="liquid" />
          <line x1="-10" x2="110" y1={h - (cap / 800) * h} y2={h - (cap / 800) * h} className="capline" />
          <text x="-12" y={h - (cap / 800) * h - 6} className="axis">
            tope 500
          </text>
          <text x="50" y={h + 26} textAnchor="middle" className="label">
            Tu billetera
          </text>
        </g>
        <path d="M150 34c30 0 44 10 56 40" className={`spill ${overflow ? 'is-on' : ''}`} />
        <g transform="translate(196 12)">
          <path d={`M0 0v${h}a8 8 0 0 0 8 8h84a8 8 0 0 0 8-8V0`} className="vessel" />
          <rect x="4" y={h - (overflow / 800) * h} width="92" height={(overflow / 800) * h} rx="4" className="liquid liquid--fund" />
          <text x="50" y={h + 26} textAnchor="middle" className="label">
            Fondo comunitario
          </text>
        </g>
      </svg>
      <p className={`sim__readout ${overflow ? 'is-warn' : ''}`}>
        <b>{eco(kept)}</b> en tu billetera
        {overflow > 0 && (
          <>
            {' '}
            · <b>{eco(overflow)}</b> pasan al fondo
          </>
        )}
        .
      </p>
      <Slider label="ECO que acumularías" value={incoming} min={0} max={800} step={10} unit="ECO" onChange={setIncoming} />
    </div>
  );
}

function InactivitySim() {
  const [days, setDays] = useState(95);
  const start = 200;
  const threshold = 60;
  const span = 180;
  const steps: { day: number; bal: number }[] = [{ day: 0, bal: start }];
  for (let d = threshold + 1; d <= span; d += 30) {
    const prev = steps[steps.length - 1].bal;
    steps.push({ day: d, bal: prev - Math.max(1, Math.round(prev * 0.1)) });
  }
  const balAt = (d: number) => [...steps].reverse().find((s) => s.day <= d)!.bal;
  const x = (d: number) => (d / span) * 320;
  const y = (b: number) => 70 - (b / start) * 60;
  let path = `M0 ${y(start)}`;
  for (const s of steps.slice(1)) path += `H${x(s.day)}V${y(s.bal)}`;
  path += `H320`;
  const now = balAt(days);
  return (
    <div className="sim">
      <svg viewBox="0 0 320 96" className="sim__svg" aria-hidden="true">
        <rect x={x(threshold)} y="4" width={320 - x(threshold)} height="68" className="band band--zone" />
        <text x="314" y="66" textAnchor="end" className="axis">
          más de 60 días quieta
        </text>
        <path d={path} className="stepline" />
        <g transform={`translate(${x(days)} 0)`} className="marker">
          <line y1="4" y2="72" />
          <circle cy={y(now)} r="5" />
        </g>
        {[0, 60, 120, 180].map((d) => (
          <text key={d} x={x(d)} y="90" textAnchor={d === 0 ? 'start' : d === 180 ? 'end' : 'middle'} className="axis">
            {d}
          </text>
        ))}
      </svg>
      <p className={`sim__readout ${now < start ? 'is-bad' : ''}`}>
        Saldo: <b>{eco(now)}</b>
        {now < start ? ` · perdió ${eco(start - now)} por inactividad.` : ' · sin penalización todavía.'}
      </p>
      <Slider label="Días sin movimientos" value={days} min={0} max={span} unit="días" onChange={setDays} />
      <p className="sim__note">Para ver solo esta regla, el ejemplo deja de lado la caducidad.</p>
    </div>
  );
}

function Rule(props: {
  n: string;
  name: string;
  stamp: ReactNode;
  how: string;
  why: string;
  sim: ReactNode;
}) {
  return (
    <article className="rule">
      <div className="rule__stamp">{props.stamp}</div>
      <div className="rule__body">
        <p className="rule__n">Regla {props.n}</p>
        <h3>{props.name}</h3>
        <dl>
          <dt>Cómo funciona</dt>
          <dd>{props.how}</dd>
          <dt>Intención solidaria</dt>
          <dd>{props.why}</dd>
        </dl>
      </div>
      <div className="rule__sim">{props.sim}</div>
    </article>
  );
}

export function Rules() {
  return (
    <section className="section rules" id="reglas" aria-labelledby="reglas-t">
      <header className="section__head">
        <p className="section__num">03 — Reglas solidarias de circulación</p>
        <h2 id="reglas-t">Si el token se acumula, deja de cumplir su función.</h2>
        <p className="section__intro prose">
          Por eso el diseño traduce valores solidarios en comportamiento del sistema. Mueve los controles para ver cada
          regla por separado; en la demo actúan las tres a la vez.
        </p>
      </header>
      <div className="rules__list">
        <Rule
          n="1"
          name="Caducidad (demurrage)"
          stamp={<Stamp ring="Caducidad · demurrage" big="30–90" small="días" rotate={-9} />}
          how="Los ECO que no se usan expiran entre 30 y 90 días después de recibirlos, según la configuración de cada nodo."
          why="Desincentivar la acumulación y hacer que el valor se mueva dentro de la comunidad."
          sim={<ExpirySim />}
        />
        <Rule
          n="2"
          name="Tope de billetera"
          stamp={<Stamp ring="Tope por usuario" big="500" small="ECO" tone="forest" rotate={6} />}
          how="Cada usuario puede tener como máximo 500 ECO. Lo que pase de ahí va automáticamente al fondo comunitario universitario."
          why="Evitar la concentración y financiar al conjunto de la comunidad."
          sim={<CapSim />}
        />
        <Rule
          n="3"
          name="Penalización por inactividad"
          stamp={<Stamp ring="Inactividad · 10 % mensual" big="60" small="días" rotate={-4} />}
          how="Las billeteras sin movimientos durante más de 60 días pierden el 10 % de su saldo cada mes."
          why="Incentivar la participación continua."
          sim={<InactivitySim />}
        />
      </div>
      <p className="footnote">
        Los valores son parámetros iniciales del prototipo y podrán ajustarse después de la prueba piloto.
      </p>
    </section>
  );
}
