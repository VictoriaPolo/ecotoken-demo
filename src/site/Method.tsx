import { Stamp } from '../ui/Stamp';

const PHASES = [
  { n: 1, name: 'Diagnóstico', what: 'Encuesta a emprendedores de varias universidades y mapeo de actores ESS en el campus.', out: 'Caracterización del problema y de los actores', focus: 'Mixto' },
  { n: 2, name: 'Diseño del sistema', what: 'Arquitectura, reglas de emisión y circulación, y gobernanza comunitaria.', out: 'Modelo de ecosistema y reglas del token', focus: 'Cualitativo' },
  { n: 3, name: 'Desarrollo', what: 'Prototipo con billetera, marketplace solidario, motor de transacciones y panel de indicadores.', out: 'Prototipo funcional', focus: 'Aplicado', now: true },
  { n: 4, name: 'Validación', what: 'Prueba piloto con usuarios reales, escala SUS de usabilidad y métricas de adopción y circulación.', out: 'Evidencia de usabilidad y adopción', focus: 'Cuantitativo' },
];

const STACK = [
  { k: 'Interfaz', v: 'React' },
  { k: 'API', v: 'Node.js + Express · REST' },
  { k: 'Acceso', v: 'JWT' },
  { k: 'Libro mayor', v: 'PostgreSQL' },
  { k: 'Validación', v: 'Escala SUS + métricas de adopción' },
];

const GOALS = [
  { big: '3', text: 'módulos funcionales: billetera, marketplace y panel de impacto' },
  { big: '30+', text: 'usuarios en la prueba piloto' },
  { big: 'SUS', text: 'usabilidad medida con usuarios reales' },
  { big: '1', text: 'modelo federado y abierto que otras universidades puedan replicar' },
];

export function Method() {
  return (
    <section className="section method" id="metodo" aria-labelledby="metodo-t">
      <header className="section__head">
        <p className="section__num">05 — Método y estado</p>
        <h2 id="metodo-t">Investigación aplicada, en cuatro fases que se retroalimentan.</h2>
        <p className="section__intro prose">
          Enfoque mixto, con emprendedores de varias universidades y el Campus Bogotá de la Universidad Cooperativa de
          Colombia como nodo inicial. El proyecto empezó el 25 de julio de 2025 y hoy está en desarrollo.
        </p>
      </header>

      <ol className="phases">
        {PHASES.map((p) => (
          <li key={p.n} className={p.now ? 'is-now' : p.n < 3 ? 'is-done' : ''}>
            <div className="phases__rail" aria-hidden="true">
              <span>{p.n}</span>
            </div>
            <p className="phases__focus">{p.focus}</p>
            <h3>{p.name}</h3>
            <p>{p.what}</p>
            <p className="phases__out">
              <span>Producto</span>
              {p.out}
            </p>
            {p.now && <Stamp ring="Fase actual · 2026" big="Aquí" tone="stamp" rotate={-12} size={112} className="phases__stamp" />}
          </li>
        ))}
      </ol>

      <div className="method__split">
        <div className="stack-list">
          <h3>Arquitectura del prototipo</h3>
          <dl>
            {STACK.map((s) => (
              <div key={s.k}>
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
          <p className="muted">
            Esta web es una simulación en el navegador para explicar el diseño; no reemplaza al prototipo con servidor.
          </p>
        </div>
        <div className="goals">
          <h3>
            Metas <span className="badge badge--warn">resultados esperados, no observados</span>
          </h3>
          <ul>
            {GOALS.map((g) => (
              <li key={g.big}>
                <b>{g.big}</b>
                <span>{g.text}</span>
              </li>
            ))}
          </ul>
          <p className="muted">
            Aún no hay datos de uso. Se espera un entorno más dinámico para quienes emprenden, más trazabilidad del
            impacto solidario y más contacto entre actores ESS de dentro y fuera del campus; eso se contrastará en la
            validación.
          </p>
        </div>
      </div>
    </section>
  );
}
