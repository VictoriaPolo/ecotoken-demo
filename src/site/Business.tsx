import { SUPUESTOS as S } from '../engine/finance';
import { cop } from '../ui/format';
import { Stamp } from '../ui/Stamp';

const STREAMS = [
  {
    model: 'SaaS',
    name: 'Licencia mensual por nodo',
    who: 'Paga la universidad',
    text: 'Una suscripción por campus que cubre servidor, soporte, actualizaciones y el panel de impacto.',
    price: `${cop(S.licenciaMes)} al mes`,
  },
  {
    model: 'Franquicia',
    name: 'Implementación del nodo',
    who: 'Paga cada universidad nueva',
    text: 'El modelo se replica campus por campus: configurar las reglas, cargar la comunidad y capacitar al equipo.',
    price: `${cop(S.implementacion)} una vez`,
  },
  {
    model: 'Marketplace',
    name: 'Membresía de aliados comerciales',
    who: 'Pagan cafeterías, papelerías y comercios',
    text: 'Aparecen en el marketplace y reciben clientes del campus que pagan en ECO. Las organizaciones ESS entran gratis.',
    price: `${cop(S.membresiaAliado)} al mes`,
  },
  {
    model: 'Ads',
    name: 'Retos patrocinados',
    who: 'Pagan empresas y fundaciones',
    text: 'Patrocinan un reto o un módulo de formación. El patrocinador paga por la campaña, no compra ECO: el premio lo emite el nodo.',
    price: `${cop(S.precioReto)} por reto`,
  },
  {
    model: 'Freemium',
    name: 'Código abierto, nodo administrado',
    who: 'La puerta de entrada',
    text: 'Cualquier universidad puede instalar EcoToken gratis por su cuenta. Lo que se cobra es tenerlo funcionando sin preocuparse.',
    price: 'Gratis / licencia',
  },
  {
    model: 'Venta por volumen',
    name: 'Descuento por sede',
    who: 'Universidades con varios campus',
    text: 'La segunda sede en adelante paga menos por nodo. Facilita crecer dentro de una misma institución.',
    price: 'No incluido en el simulador',
  },
];

const QUESTIONS = [
  {
    n: '1',
    q: '¿Qué valor entregamos?',
    a: 'A la universidad, un ecosistema de emprendimiento activo y medible. A los aliados, clientes. A los patrocinadores, contacto con jóvenes en acciones con propósito. A los estudiantes, un canal gratis para vender, aprender y participar.',
  },
  {
    n: '2',
    q: '¿Cómo lo entregamos?',
    a: 'Una plataforma web por nodo, con las reglas de cada universidad, más implementación, capacitación, soporte e informes de impacto.',
  },
  {
    n: '3',
    q: '¿Cómo capturamos valor?',
    a: 'Cobrándole a quien recibe valor del ecosistema, nunca al estudiante por usar la moneda. Son seis fuentes, abajo.',
  },
];

export function Business() {
  return (
    <section className="section business" id="negocio" aria-labelledby="negocio-t">
      <header className="section__head">
        <p className="section__num">05 — Modelo de negocio</p>
        <h2 id="negocio-t">Los estudiantes no pagan. Entonces, ¿quién?</h2>
        <p className="section__intro prose">
          En EcoToken nadie compra ECO con pesos ni paga comisión por intercambiar: si la app le pidiera dinero a los
          estudiantes dejaría de ser una moneda solidaria. Las ganancias salen de quienes reciben valor del ecosistema.
        </p>
      </header>

      <div className="circuits">
        <div className="circuit circuit--eco">
          <p className="circuit__label">Circuito del ECO · dentro de la app</p>
          <p className="circuit__flow">
            <span>Estudiantes</span>
            <i aria-hidden="true">⇄</i>
            <span>Emprendimientos</span>
            <i aria-hidden="true">⇄</i>
            <span>Organizaciones ESS</span>
          </p>
          <p className="circuit__note">Gratis. El ECO no se compra ni se vende, y caduca si no circula.</p>
        </div>
        <div className="circuit circuit--cop">
          <p className="circuit__label">Circuito del peso · fuera de la app</p>
          <p className="circuit__flow">
            <span>Universidades</span>
            <span>Aliados comerciales</span>
            <span>Patrocinadores</span>
            <i aria-hidden="true">→</i>
            <b>Operación de EcoToken</b>
          </p>
          <p className="circuit__note">Pagan licencias, membresías y retos. Con esto se cubren servidores, soporte y equipo.</p>
        </div>
        <Stamp ring="Gratis para estudiantes" big="$0" small="por usar" rotate={-10} size={150} className="circuits__stamp" />
      </div>

      <ol className="ledger-table business__questions">
        {QUESTIONS.map((r) => (
          <li key={r.n} className="ledger-table__row">
            <span className="ledger-table__n" aria-hidden="true">
              {r.n}
            </span>
            <div className="ledger-table__verb">
              <h3>{r.q}</h3>
            </div>
            <p className="prose">{r.a}</p>
          </li>
        ))}
      </ol>

      <h3 className="business__sub">Fuentes de ingreso, según los modelos vistos en clase</h3>
      <ul className="streams">
        {STREAMS.map((s) => (
          <li key={s.name}>
            <p className="streams__model">{s.model}</p>
            <h4>{s.name}</h4>
            <p className="streams__who">{s.who}</p>
            <p>{s.text}</p>
            <p className="streams__price">{s.price}</p>
          </li>
        ))}
      </ul>

      <div className="never">
        <h3>Lo que nunca se cobra</h3>
        <ul>
          <li>Comprar o vender ECO con pesos</li>
          <li>Comisión por cada intercambio</li>
          <li>Crear una cuenta de estudiante</li>
          <li>Datos personales: los informes de impacto son agregados y anónimos</li>
        </ul>
      </div>
    </section>
  );
}
