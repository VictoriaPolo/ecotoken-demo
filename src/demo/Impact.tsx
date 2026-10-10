import { CATEGORY_LABEL } from '../data/catalog';
import { eco, num } from '../ui/format';
import { NetworkMap } from '../ui/NetworkMap';
import { useDemo } from './store';

function WeeklyBars({ data }: { data: { label: string; amount: number; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  const w = 420;
  const h = 150;
  const bw = w / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h + 26}`} className="bars" role="img" aria-label="ECO intercambiados por semana">
      {[0.5, 1].map((f) => (
        <line key={f} x1="0" x2={w} y1={h - f * (h - 14)} y2={h - f * (h - 14)} className="bars__grid" />
      ))}
      {data.map((d, i) => {
        const bh = (d.amount / max) * (h - 14);
        const last = i === data.length - 1;
        return (
          <g key={i} transform={`translate(${i * bw} 0)`}>
            <rect x={bw * 0.18} y={h - bh} width={bw * 0.64} height={Math.max(bh, 1)} rx="2" className={last ? 'is-now' : ''}>
              <title>
                {d.label}: {d.amount} ECO en {d.count} intercambios
              </title>
            </rect>
            {(last || d.amount === max) && (
              <text x={bw / 2} y={h - bh - 6} textAnchor="middle" className="bars__val">
                {num(d.amount)}
              </text>
            )}
            <text x={bw / 2} y={h + 18} textAnchor="middle" className="bars__lbl">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Impact() {
  const { state, metrics } = useDemo();
  const e = state.economy;
  const totalCat = metrics.byCategory.reduce((s, c) => s + c.amount, 0) || 1;
  const kpis = [
    { label: 'intercambios', value: num(metrics.exchanges) },
    { label: 'miembros activos · 30 d', value: `${metrics.activeMembers}/${metrics.totalMembers}` },
    { label: 'organizaciones ESS', value: num(metrics.orgs) },
    { label: 'ECO en circulación', value: num(metrics.circulating) },
    { label: 'fondo comunitario', value: num(e.fund) },
    { label: 'veces que rotó el saldo · 30 d', value: metrics.velocity.toFixed(2).replace('.', ',') },
  ];
  return (
    <div className="impact">
      <div className="impact__head">
        <h3>Panel de impacto ESS</h3>
        <p className="badge">Datos de ejemplo · día {e.day}</p>
      </div>
      <dl className="kpis">
        {kpis.map((k) => (
          <div key={k.label}>
            <dd>{k.value}</dd>
            <dt>{k.label}</dt>
          </div>
        ))}
      </dl>
      <div className="impact__grid">
        <section className="panel">
          <h3>
            ECO intercambiados por semana <small>compras y transferencias</small>
          </h3>
          <WeeklyBars data={metrics.weekly} />
        </section>
        <section className="panel">
          <h3>
            Red de intercambios <small>grosor = volumen</small>
          </h3>
          <NetworkMap members={e.members} links={metrics.links} highlight={state.me} compact />
        </section>
        <section className="panel impact__cats">
          <h3>
            ¿En qué se mueve el ECO? <small>todo el piloto</small>
          </h3>
          <div className="stack" aria-hidden="true">
            {metrics.byCategory.map((c) => (
              <span key={c.category} className={`stack__seg seg--${c.category}`} style={{ flexGrow: c.amount }} />
            ))}
          </div>
          <ul className="legend">
            {metrics.byCategory.map((c) => (
              <li key={c.category}>
                <i className={`seg--${c.category}`} />
                {CATEGORY_LABEL[c.category]}
                <b>{Math.round((c.amount / totalCat) * 100)} %</b>
                <small>{eco(c.amount)}</small>
              </li>
            ))}
          </ul>
          <p className="muted">
            Lo que el panel quiere responder para las organizaciones ESS: cuánto se intercambia, entre quiénes y en qué.
          </p>
        </section>
      </div>
    </div>
  );
}
