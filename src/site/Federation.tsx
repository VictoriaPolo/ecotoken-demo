const NODES = [
  { id: '001', x: 190, y: 150, label: 'UCC · Campus Bogotá', sub: 'nodo inicial', live: true },
  { id: '002', x: 420, y: 70, label: 'Otra universidad', sub: 'sus propios parámetros' },
  { id: '003', x: 470, y: 250, label: 'Otra universidad', sub: 'su propia gobernanza' },
  { id: '004', x: 70, y: 300, label: '¿La tuya?', sub: 'código abierto' },
];

const EDGES = [
  ['001', '002'],
  ['001', '003'],
  ['002', '003'],
  ['001', '004'],
];

export function Federation() {
  const at = (id: string) => NODES.find((n) => n.id === id)!;
  return (
    <section className="section federation" id="nodos" aria-labelledby="nodos-t">
      <div className="federation__grid">
        <header className="section__head">
          <p className="section__num">06 — Modelo federado</p>
          <h2 id="nodos-t">Un nodo por universidad. Una red entre todas.</h2>
          <p className="prose">
            Cada institución puede montar su propio nodo, con sus parámetros (cuánto dura el ECO, cuál es el tope) y su
            forma de gobernarlo. Más adelante, los nodos podrían conectarse para que el ecosistema crezca más allá del
            campus.
          </p>
          <p className="prose">
            Que el código sea abierto busca justo eso: que adoptarlo no tenga costo de licencia y que replicarlo sea
            fácil.
          </p>
          <a className="btn btn--ink" href="mailto:laura.polo@campusucc.edu.co?subject=EcoToken%20-%20nodo%20universitario">
            Quiero un nodo en mi universidad
          </a>
        </header>
        <svg className="fedmap" viewBox="0 0 560 380" role="img" aria-label="Nodo inicial en Bogotá conectado con futuros nodos de otras universidades">
          {EDGES.map(([a, b]) => (
            <line key={a + b} x1={at(a).x} y1={at(a).y} x2={at(b).x} y2={at(b).y} className={a === '001' ? 'is-planned' : 'is-future'} />
          ))}
          {NODES.map((n) => (
            <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={`fednode ${n.live ? 'is-live' : ''}`}>
              <circle r={n.live ? 46 : 34} />
              {n.live && <circle r="56" className="fednode__halo" />}
              <text y="-2" textAnchor="middle" className="fednode__id">
                {n.id}
              </text>
              <text y="16" textAnchor="middle" className="fednode__eco">
                ECO
              </text>
              <text y={n.live ? 76 : 62} textAnchor="middle" className="fednode__label">
                {n.label}
              </text>
              <text y={n.live ? 93 : 79} textAnchor="middle" className="fednode__sub">
                {n.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
