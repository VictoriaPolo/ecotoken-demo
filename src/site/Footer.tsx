import { Wordmark } from './Header';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Wordmark />
        <p>
          Moneda digital comunitaria para ecosistemas solidarios universitarios. Prototipo académico de código abierto.
        </p>
        <p className="footer__fine">
          Demo con datos y personas de ejemplo · sin dinero real · el ECO no es un activo para especular.
        </p>
      </div>
    </footer>
  );
}
