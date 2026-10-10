import { Banknote } from '../ui/Banknote';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__text">
        <p className="kicker">
          Moneda digital comunitaria <span>·</span> prototipo de código abierto <span>·</span> VI ESIS 2026
        </p>
        <h1 className="hero__title">
          Una moneda que no se deja <span className="strike">guardar</span>.
        </h1>
        <p className="hero__lead">
          EcoToken conecta a quienes emprenden en la universidad con las organizaciones de la economía social y
          solidaria. El ECO se gana ofreciendo servicios, vendiendo o participando, y se gasta dentro de la misma
          comunidad. Como caduca, <em>circula</em>.
        </p>
        <div className="hero__actions">
          <a className="btn btn--ink" href="#demo">
            Probar la demo
            <span aria-hidden="true">↓</span>
          </a>
          <a className="btn btn--line" href="#reglas">
            Ver las tres reglas
          </a>
        </div>
        <dl className="hero__facts">
          <div>
            <dt>Inicio</dt>
            <dd>25 jul 2025</dd>
          </div>
          <div>
            <dt>Fase actual</dt>
            <dd>3 de 4 · desarrollo</dd>
          </div>
          <div>
            <dt>Nodo inicial</dt>
            <dd>UCC · Campus Bogotá</dd>
          </div>
        </dl>
      </div>
      <div className="hero__notes" aria-hidden="true">
        <Banknote value={20} serial="ECO-BOG-000117" className="note note--back" stamped={2} />
        <Banknote value={50} serial="ECO-BOG-000240" className="note note--front" stamped={1} />
        <p className="hero__caption">Billete ilustrativo. El ECO es digital: vive en la billetera de la plataforma.</p>
      </div>
    </section>
  );
}
