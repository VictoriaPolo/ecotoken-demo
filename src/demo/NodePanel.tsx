import { useId } from 'react';
import { DEFAULT_CONFIG } from '../data/catalog';
import { penaltyCanTrigger } from '../engine/rules';
import { FUND, RETIRED, type NodeConfig } from '../engine/types';
import { eco, num } from '../ui/format';
import { useDemo } from './store';

function Param(props: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="param">
      <label htmlFor={id}>
        <span>{props.label}</span>
        <output htmlFor={id}>
          {num(props.value)} {props.unit}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ ['--fill' as string]: `${((props.value - props.min) / (props.max - props.min)) * 100}%` }}
      />
      <small>{props.hint}</small>
    </div>
  );
}

export function NodePanel() {
  const { state, dispatch } = useDemo();
  const e = state.economy;
  const c = e.config;
  const set = (patch: Partial<NodeConfig>) => dispatch({ type: 'config', patch });
  const sources = (['excedente', 'caducidad', 'inactividad'] as const).map((k) => ({
    k,
    fund: e.ledger.filter((t) => t.kind === k && t.to === FUND).reduce((s, t) => s + t.amount, 0),
    retired: e.ledger.filter((t) => t.kind === k && t.to === RETIRED).reduce((s, t) => s + t.amount, 0),
  }));
  const changed = (Object.keys(DEFAULT_CONFIG) as (keyof NodeConfig)[]).some((k) => DEFAULT_CONFIG[k] !== c[k]);

  return (
    <div className="nodepanel">
      <section className="panel nodepanel__params">
        <h3>
          Parámetros del nodo 001 <small>cada universidad fija los suyos</small>
        </h3>
        <Param
          label="Caducidad"
          hint="Días que duran los ECO recibidos sin usarse (30 a 90)."
          value={c.expiryDays}
          min={30}
          max={90}
          step={5}
          unit="días"
          onChange={(v) => set({ expiryDays: v })}
        />
        <Param
          label="Tope de billetera"
          hint="Saldo máximo por persona; lo demás va al fondo."
          value={c.walletCap}
          min={100}
          max={1000}
          step={50}
          unit="ECO"
          onChange={(v) => set({ walletCap: v })}
        />
        <Param
          label="Umbral de inactividad"
          hint="Días sin movimientos antes de penalizar."
          value={c.inactivityDays}
          min={30}
          max={120}
          step={5}
          unit="días"
          onChange={(v) => set({ inactivityDays: v })}
        />
        <Param
          label="Penalización mensual"
          hint="Porcentaje del saldo que pierde una billetera quieta."
          value={c.penaltyPct}
          min={0}
          max={25}
          step={1}
          unit="%"
          onChange={(v) => set({ penaltyPct: v })}
        />
        <fieldset className="radio">
          <legend>Lo que caduca o se penaliza…</legend>
          <label>
            <input type="radio" name="dest" checked={c.retainedTo === 'fondo'} onChange={() => set({ retainedTo: 'fondo' })} />
            va al fondo comunitario
          </label>
          <label>
            <input type="radio" name="dest" checked={c.retainedTo === 'retiro'} onChange={() => set({ retainedTo: 'retiro' })} />
            sale de circulación
          </label>
          <small>Este punto sigue abierto: lo define la gobernanza de cada nodo.</small>
        </fieldset>
        {!penaltyCanTrigger(c) && (
          <p className="insight">
            Con caducidad de {c.expiryDays} días y umbral de {c.inactivityDays}, una billetera quieta pierde sus ECO por
            caducidad antes de que la penalización llegue a aplicarse. Las dos reglas se pisan: es el tipo de ajuste que
            el piloto debe calibrar.
          </p>
        )}
        <p className="muted">
          Los cambios aplican desde hoy: los lotes que ya tienes conservan su fecha de vencimiento.
          {changed && (
            <>
              {' '}
              <button className="linkbtn" onClick={() => set(DEFAULT_CONFIG)}>
                Volver a los valores iniciales
              </button>
            </>
          )}
        </p>
      </section>

      <section className="panel nodepanel__fund">
        <h3>
          Fondo comunitario <small>universitario</small>
        </h3>
        <p className="fund__total">
          {num(e.fund)}
          <span>ECO</span>
        </p>
        <ul className="fund__sources">
          {sources.map((s) => (
            <li key={s.k}>
              <span>
                {s.k === 'excedente' ? 'Excedentes sobre el tope' : s.k === 'caducidad' ? 'ECO caducados' : 'Penalización por inactividad'}
              </span>
              <b>{eco(s.fund)}</b>
            </li>
          ))}
        </ul>
        {e.retired > 0 && <p className="muted">Fuera de circulación: {eco(e.retired)}.</p>}
        <p className="muted">
          Cómo se gobierna y en qué se usa este fondo es uno de los retos abiertos del proyecto.
        </p>
      </section>
    </div>
  );
}
