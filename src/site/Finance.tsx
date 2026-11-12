import { useMemo, useState } from 'react';
import {
  depreciacionMes,
  estadoResultados,
  proyectar,
  puntoEquilibrio,
  SUPUESTOS,
  type Anual,
  type Balance,
  type Mes,
  type Supuestos,
} from '../engine/finance';
import { cop, mill, pct } from '../ui/format';
import { Slider } from './Rules';

function CashChart({ meses, equilibrio, minimo }: { meses: Mes[]; equilibrio: number | null; minimo: Mes }) {
  const w = 640;
  const h = 230;
  const top = 18;
  const bottom = 26;
  const vals = meses.flatMap((m) => [m.flujo, m.caja]);
  const hi = Math.max(0, ...vals);
  const lo = Math.min(0, ...vals);
  const y = (v: number) => top + ((hi - v) / (hi - lo || 1)) * (h - top - bottom);
  const bw = w / meses.length;
  const x = (mes: number) => (mes - 0.5) * bw;
  const line = meses.map((m, i) => `${i ? 'L' : 'M'}${x(m.mes).toFixed(1)} ${y(m.caja).toFixed(1)}`).join('');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="cashchart" role="img" aria-label="Flujo de caja mensual y saldo de caja durante 24 meses">
      {equilibrio && (
        <g className="cashchart__pe">
          <line x1={x(equilibrio) - bw / 2} x2={x(equilibrio) - bw / 2} y1={top - 8} y2={h - bottom} />
          <text x={x(equilibrio) - bw / 2 + 4} y={top}>
            punto de equilibrio
          </text>
        </g>
      )}
      <line x1="0" x2={w} y1={y(0)} y2={y(0)} className="cashchart__zero" />
      {meses.map((m) => (
        <rect
          key={m.mes}
          x={x(m.mes) - bw * 0.32}
          width={bw * 0.64}
          y={Math.min(y(0), y(m.flujo))}
          height={Math.max(1, Math.abs(y(m.flujo) - y(0)))}
          className={m.flujo < 0 ? 'is-neg' : 'is-pos'}
        >
          <title>
            Mes {m.mes}: flujo {cop(m.flujo)}, caja {cop(m.caja)}
          </title>
        </rect>
      ))}
      <path d={line} className="cashchart__line" />
      <circle cx={x(minimo.mes)} cy={y(minimo.caja)} r="5" className={`cashchart__min ${minimo.caja < 0 ? 'is-neg' : ''}`} />
      {meses
        .filter((m) => m.mes === 1 || m.mes % 6 === 0)
        .map((m) => (
          <text key={m.mes} x={x(m.mes)} y={h - 8} textAnchor="middle" className="cashchart__lbl">
            {m.mes === 1 ? 'mes 1' : m.mes}
          </text>
        ))}
    </svg>
  );
}

const ROWS: { label: string; key: keyof Anual; kind?: 'sub' | 'total' | 'minus'; margin?: keyof Anual; note?: string }[] = [
  { label: 'Licencias (SaaS)', key: 'licencias', kind: 'sub' },
  { label: 'Implementaciones', key: 'implementaciones', kind: 'sub' },
  { label: 'Membresías de aliados', key: 'membresias', kind: 'sub' },
  { label: 'Retos patrocinados', key: 'retos', kind: 'sub' },
  { label: 'Ingresos operacionales', key: 'ingresos', kind: 'total' },
  { label: '(−) Costo de ventas', key: 'costoVentas', kind: 'minus', note: 'servidores y soporte por nodo' },
  { label: 'Utilidad bruta', key: 'utilidadBruta', kind: 'total', margin: 'margenBruto' },
  { label: '(−) Gastos de administración y ventas', key: 'gastosAdm', kind: 'minus' },
  { label: '(−) Depreciación y amortización', key: 'depreciacion', kind: 'minus', note: 'equipos y software' },
  { label: 'Utilidad operacional', key: 'utilidadOperacional', kind: 'total', margin: 'margenOperacional' },
  { label: '(−) Gastos financieros', key: 'intereses', kind: 'minus', note: 'intereses de la deuda' },
  { label: 'Utilidad antes de impuestos', key: 'uai', kind: 'total' },
  { label: '(−) Impuesto de renta', key: 'impuesto', kind: 'minus' },
  { label: 'Utilidad neta', key: 'utilidadNeta', kind: 'total', margin: 'margenNeto' },
];

const MARGIN_LABEL: Partial<Record<keyof Anual, string>> = {
  margenBruto: 'margen bruto',
  margenOperacional: 'margen operacional',
  margenNeto: 'margen neto',
};

function BalanceTable({ title, b }: { title: string; b: Balance }) {
  const ok = Math.abs(b.activos - b.pasivos - b.patrimonio) < 1;
  const line = (label: string, v: number, total = false) => (
    <p className={total ? 'taccount__total' : ''}>
      <span>{label}</span>
      <span>{mill(v)}</span>
    </p>
  );
  return (
    <div className="taccount">
      <p className="taccount__title">
        {title} <span className={ok ? 'is-ok' : 'is-bad'}>{ok ? 'cuadra ✓' : 'no cuadra'}</span>
      </p>
      <div className="taccount__cols">
        <div>
          <p className="taccount__head">Activo</p>
          {line('Efectivo', b.efectivo)}
          {line('Cuentas por cobrar', b.cartera)}
          {line('Equipos y software', b.activosFijos)}
          {line('Total', b.activos, true)}
        </div>
        <div>
          <p className="taccount__head">Pasivo + patrimonio</p>
          {line('Deuda', b.deuda)}
          {line('Proveedores e impuestos', b.proveedores + b.impuestoPorPagar)}
          {line('Aportes de socios', b.aportes)}
          {line('Utilidades acumuladas', b.utilidades)}
          {line('Total', b.pasivos + b.patrimonio, true)}
        </div>
      </div>
    </div>
  );
}

export function Finance() {
  const [s, setS] = useState<Supuestos>(SUPUESTOS);
  const set = (patch: Partial<Supuestos>) => setS((prev) => ({ ...prev, ...patch }));
  const p = useMemo(() => proyectar(s), [s]);
  const a1 = estadoResultados(p.meses.slice(0, 12));
  const a2 = estadoResultados(p.meses.slice(12, 24));
  const pe = puntoEquilibrio(s);
  const mesPE = p.meses.find((m) => m.nodos >= pe.nodos)?.mes ?? null;
  const minimo = p.meses.reduce((lo, m) => (m.caja < lo.caja ? m : lo), p.meses[0]);
  // El mínimo de caja inicial que evita que la caja quede en rojo en algún mes.
  const necesario = Math.max(0, s.capitalTrabajo - minimo.caja);
  const ultimo = p.meses[p.meses.length - 1];
  const gastosMes = ultimo.costoVentas + ultimo.gastosAdm;
  const cce = s.diasCartera - s.diasProveedores;
  const capacidad = ultimo.soporte * s.nodosPorSoporte;
  const changed = (Object.keys(SUPUESTOS) as (keyof Supuestos)[]).some((k) => SUPUESTOS[k] !== s[k]);

  const indicadores = [
    {
      name: 'Fondo de emergencias',
      formula: 'activos líquidos ÷ gastos mensuales',
      value: `${(p.final.efectivo / gastosMes).toFixed(1).replace('.', ',')} meses`,
      ref: 'referencia: más de 4,4',
      ok: p.final.efectivo / gastosMes > 4.4,
    },
    {
      name: 'Activos líquidos',
      formula: 'activos líquidos ÷ activos totales',
      value: pct(p.final.efectivo / p.final.activos),
      ref: 'depende del negocio',
      ok: null,
    },
    {
      name: 'Deuda frente al ingreso',
      formula: 'cuota mensual de la deuda ÷ ingresos del mes',
      value: pct(ultimo.servicioDeuda / ultimo.ingresos),
      ref: 'referencia: menos de 35 %',
      ok: ultimo.servicioDeuda / ultimo.ingresos < 0.35,
    },
    {
      name: 'Rentabilidad de los activos',
      formula: 'utilidad neta año 2 ÷ activos totales',
      value: pct(a2.utilidadNeta / p.final.activos),
      ref: '¿cuánto produce lo invertido?',
      ok: a2.utilidadNeta > 0,
    },
    {
      name: 'Ciclo de conversión de efectivo',
      formula: 'días de cartera + días de inventario − días de proveedores',
      value: `${cce} días`,
      ref: 'servicio digital: sin inventario',
      ok: cce <= 30,
    },
    {
      name: 'Capacidad instalada',
      formula: 'nodos atendidos ÷ capacidad del equipo de soporte',
      value: pct(ultimo.nodos / capacidad),
      ref: `${ultimo.soporte} ${ultimo.soporte === 1 ? 'persona atiende' : 'personas atienden'} hasta ${capacidad} nodos`,
      ok: ultimo.nodos / capacidad <= 0.9,
    },
  ];

  return (
    <section className="section finance" id="numeros" aria-labelledby="numeros-t">
      <header className="section__head">
        <p className="section__num">06 — Aspectos contables</p>
        <h2 id="numeros-t">¿Es sostenible? Los números del negocio.</h2>
        <p className="section__intro prose">
          Proyección a 24 meses con cifras estimadas en pesos colombianos. Mueve los supuestos y se recalculan el estado
          de resultados, el flujo de caja, el balance y los indicadores.
        </p>
      </header>

      <div className="finance__grid">
        <aside className="finance__controls" aria-label="Supuestos del modelo">
          <p className="finance__group">Crecimiento e ingresos</p>
          <Slider label="Universidades nuevas por semestre" value={s.nodosPorSemestre} min={0} max={4} unit="" onChange={(v) => set({ nodosPorSemestre: v })} />
          <Slider label="Licencia por nodo al mes" value={s.licenciaMes} min={800_000} max={3_500_000} step={100_000} format={cop} onChange={(v) => set({ licenciaMes: v })} />
          <Slider label="Aliados comerciales por nodo" value={s.aliadosPorNodo} min={0} max={15} unit="" onChange={(v) => set({ aliadosPorNodo: v })} />
          <Slider label="Retos patrocinados al mes" value={s.retosPorMes} min={0} max={4} unit="" onChange={(v) => set({ retosPorMes: v })} />
          <p className="finance__group">Financiación y caja</p>
          <Slider label="Deuda en la estructura de capital" value={Math.round(s.pctDeuda * 100)} min={0} max={80} step={5} unit="%" onChange={(v) => set({ pctDeuda: v / 100 })} />
          <Slider label="Días que tarda en pagar la universidad" value={s.diasCartera} min={0} max={120} step={15} unit="días" onChange={(v) => set({ diasCartera: v })} />
          <Slider label="Capital de trabajo inicial" value={s.capitalTrabajo} min={10_000_000} max={80_000_000} step={5_000_000} format={cop} onChange={(v) => set({ capitalTrabajo: v })} />
          {changed && (
            <button className="linkbtn" onClick={() => setS(SUPUESTOS)}>
              Volver a los supuestos iniciales
            </button>
          )}
        </aside>

        <div className="finance__report">
          <dl className="kpis finance__kpis">
            <div>
              <dd>{Number.isFinite(pe.nodos) ? pe.nodos : '—'}</dd>
              <dt>
                universidades para el punto de equilibrio{mesPE ? ` · se alcanza en el mes ${mesPE}` : ' · no se alcanza en 24 meses'}
              </dt>
            </div>
            <div>
              <dd className={a2.utilidadNeta < 0 ? 'is-neg' : ''}>{cop(a2.utilidadNeta)}</dd>
              <dt>utilidad neta del año 2 · margen neto {pct(a2.margenNeto)}</dt>
            </div>
            <div>
              <dd className={minimo.caja < 0 ? 'is-neg' : ''}>{cop(minimo.caja)}</dd>
              <dt>punto más bajo de la caja · mes {minimo.mes}</dt>
            </div>
            <div>
              <dd>{cop(necesario)}</dd>
              <dt>capital de trabajo necesario · aportado {cop(s.capitalTrabajo)}</dt>
            </div>
          </dl>

          <section className="panel">
            <h3>
              Estado de resultados <small>millones de pesos</small>
            </h3>
            <div className="pyg__scroll">
              <table className="pyg">
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col">Año 1</th>
                    <th scope="col">Año 2</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.key} className={r.kind ? `is-${r.kind}` : ''}>
                      <th scope="row">
                        {r.label}
                        {r.note && <small>{r.note}</small>}
                        {r.margin && <small className="pyg__margin">{MARGIN_LABEL[r.margin]}</small>}
                      </th>
                      {[a1, a2].map((y, i) => (
                        <td key={i}>
                          {mill(y[r.key])}
                          {r.margin && <small className="pyg__margin">{pct(y[r.margin])}</small>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted">
              Margen bruto: solo costos directos del servicio. Operacional: suma los gastos de administración, ventas y
              depreciación. Neto: suma además intereses e impuesto de renta ({pct(s.tasaRenta)}).
            </p>
          </section>

          <section className="panel">
            <h3>
              Flujo de caja <small>24 meses · barras: flujo del mes · línea: saldo en caja</small>
            </h3>
            <CashChart meses={p.meses} equilibrio={mesPE} minimo={minimo} />
            <p className="fin-card__text">
              La utilidad no es caja. Con {s.diasCartera} días de cartera y {s.diasProveedores} de proveedores, el ciclo de
              conversión de efectivo es de <b>{cce} días</b>: se paga primero y se cobra después.{' '}
              {minimo.caja < 0
                ? `Por eso la caja toca fondo en el mes ${minimo.mes} con ${cop(minimo.caja)}: faltarían ${cop(-minimo.caja)} de capital de trabajo.`
                : `La caja toca su punto más bajo en el mes ${minimo.mes} (${cop(minimo.caja)}) sin quedar en rojo.`}
            </p>
          </section>

            <section className="panel">
              <h3>
                Estructura de capital <small>inversión inicial {cop(p.prestamo + p.aportes)}</small>
              </h3>
              <div className="capbar2" aria-hidden="true">
                <span style={{ flexGrow: p.prestamo || 0.0001 }}>Deuda {pct(s.pctDeuda)}</span>
                <span style={{ flexGrow: p.aportes || 0.0001 }}>Patrimonio {pct(1 - s.pctDeuda)}</span>
              </div>
              <p className="fin-card__text">
                {cop(p.prestamo)} de deuda al {pct(s.tasaEA)} E.A. a {s.plazoMeses} meses (cuota de {cop(p.cuota)}) y{' '}
                {cop(p.aportes)} de los socios. El capital de los socios es más costoso que la deuda: ellos esperan una
                rentabilidad mayor porque asumen más riesgo.
              </p>
            </section>
            <section className="panel">
              <h3>
                Balance <small>activo = pasivo + patrimonio</small>
              </h3>
              <div className="taccounts">
                <BalanceTable title="Al empezar" b={p.inicial} />
                <BalanceTable title="Mes 24" b={p.final} />
              </div>
            </section>

          <section className="panel">
            <h3>
              Indicadores <small>al mes 24</small>
            </h3>
            <ul className="indicators">
              {indicadores.map((i) => (
                <li key={i.name} className={i.ok === null ? '' : i.ok ? 'is-ok' : 'is-bad'}>
                  <p className="indicators__name">{i.name}</p>
                  <p className="indicators__value">{i.value}</p>
                  <p className="indicators__formula">{i.formula}</p>
                  <p className="indicators__ref">{i.ref}</p>
                </li>
              ))}
            </ul>
          </section>

          <details className="panel assumptions">
            <summary>Supuestos fijos del modelo</summary>
            <dl>
              <div><dt>Implementación por universidad nueva</dt><dd>{cop(s.implementacion)}</dd></div>
              <div><dt>Membresía de aliado comercial</dt><dd>{cop(s.membresiaAliado)} / mes</dd></div>
              <div><dt>Precio de un reto patrocinado</dt><dd>{cop(s.precioReto)}</dd></div>
              <div><dt>Servidor y base de datos por nodo</dt><dd>{cop(s.hostingNodo)} / mes</dd></div>
              <div><dt>Persona de soporte (con prestaciones)</dt><dd>{cop(s.salarioSoporte)} / mes, hasta {s.nodosPorSoporte} nodos</dd></div>
              <div><dt>Gastos de administración y ventas</dt><dd>{cop(s.gastosAdmVentas)} / mes</dd></div>
              <div><dt>Equipos (5 años) y software (3 años)</dt><dd>{cop(s.equipos)} y {cop(s.software)} · {cop(depreciacionMes(s))} / mes</dd></div>
              <div><dt>Universidades al empezar</dt><dd>{s.nodosIniciales} (nodo piloto)</dd></div>
              <div><dt>Días de proveedores</dt><dd>{s.diasProveedores}</dd></div>
              <div><dt>Impuesto de renta</dt><dd>{pct(s.tasaRenta)}, se paga al año siguiente</dd></div>
            </dl>
            <p className="muted">Simplificaciones: sin IVA, sin traslado de pérdidas fiscales y sin descuentos por volumen.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
