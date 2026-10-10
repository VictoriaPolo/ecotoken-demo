import { useState } from 'react';
import { useDemo } from '../demo/store';
import { NetworkMap } from '../ui/NetworkMap';

export function Problem() {
  const [connected, setConnected] = useState(false);
  const { state, metrics } = useDemo();
  return (
    <section className="section problem" id="problema" aria-labelledby="problema-t">
      <header className="section__head">
        <p className="section__num">01 — El problema</p>
        <h2 id="problema-t">Muchos actores, pocas conexiones.</h2>
      </header>
      <div className="problem__grid">
        <div className="problem__text">
          <p className="prose">
            Un estudiante que vende diseños, otro que da tutorías y una cooperativa que organiza un taller suelen
            trabajar cada uno por su lado. Se promocionan por WhatsApp o redes sociales, no dejan registro de lo que
            intercambian y rara vez se enteran de lo que hacen los demás.
          </p>
          <ul className="symptoms">
            <li>
              <b>Actores aislados</b>
              <span>Emprendimientos y organizaciones ESS que no se encuentran.</span>
            </li>
            <li>
              <b>Sin trazabilidad</b>
              <span>Nadie puede mostrar el impacto colectivo de lo que se intercambia.</span>
            </li>
            <li>
              <b>Solo canales informales</b>
              <span>Mensajes y publicaciones sueltas en lugar de un espacio común.</span>
            </li>
          </ul>
        </div>
        <figure className="problem__map">
          <div className="switch" role="radiogroup" aria-label="Ver el campus">
            <button role="radio" aria-checked={!connected} onClick={() => setConnected(false)}>
              Hoy
            </button>
            <button role="radio" aria-checked={connected} onClick={() => setConnected(true)}>
              Con EcoToken
            </button>
          </div>
          <NetworkMap members={state.economy.members} links={connected ? metrics.links : []} isolated={!connected} />
          <figcaption>
            {connected
              ? `Cada línea es un intercambio registrado en el libro mayor (${metrics.exchanges} hasta el día ${state.economy.day} de la simulación). Quien no participa, como Camila, se queda fuera de la red.`
              : 'Nueve actores de ejemplo, cada uno con su propio chat. Lo que se intercambia no queda en ninguna parte.'}
          </figcaption>
        </figure>
      </div>
      <blockquote className="question">
        <p className="question__label">Pregunta de investigación</p>
        <p className="question__text">
          ¿Cómo puede una moneda digital fortalecer los ecosistemas solidarios universitarios y animar a más jóvenes a
          participar en la economía social y solidaria?
        </p>
      </blockquote>
    </section>
  );
}
