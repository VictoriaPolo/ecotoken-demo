const ROWS = [
  {
    n: '1',
    verb: 'Ganar',
    how: 'Ofreciendo, vendiendo y participando.',
    items: [
      'Tutorías',
      'Diseño',
      'Desarrollo web',
      'Traducciones',
      'Ventas en el marketplace',
      'Ferias y eventos ESS',
      'Módulos de formación solidaria',
      'Vincular nuevos miembros',
    ],
  },
  {
    n: '2',
    verb: 'Guardar',
    how: 'En una billetera con reglas a la vista.',
    items: ['Saldo en ECO', 'Tope máximo', 'Historial de movimientos', 'Fecha de vencimiento'],
  },
  {
    n: '3',
    verb: 'Usar',
    how: 'Dentro de la misma comunidad.',
    items: [
      'Compras en el marketplace',
      'Talleres y ferias',
      'Transferencias entre usuarios',
      'Canjes con organizaciones ESS aliadas',
    ],
  },
];

export function Cycle() {
  return (
    <section className="section cycle" id="ciclo" aria-labelledby="ciclo-t">
      <header className="section__head">
        <p className="section__num">02 — Cómo funciona</p>
        <h2 id="ciclo-t">Ganar, guardar, usar. Y vuelta a empezar.</h2>
        <p className="section__intro prose">
          El ECO no se compra con pesos ni se piensa para especular: es una unidad de cuenta y de intercambio que solo
          circula entre los miembros del ecosistema universitario y las organizaciones que se suman.
        </p>
      </header>
      <ol className="ledger-table">
        {ROWS.map((r) => (
          <li key={r.n} className="ledger-table__row">
            <span className="ledger-table__n" aria-hidden="true">
              {r.n}
            </span>
            <div className="ledger-table__verb">
              <h3>{r.verb}</h3>
              <p>{r.how}</p>
            </div>
            <ul className="tags">
              {r.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
