import { Wordmark } from './Header';

const REFS = [
  'Berardi, L., & Valentinetti, D. (2022). Digitalization of social impact for social economy organizations. Canadian Journal of Nonprofit and Social Economy Research, 13(2).',
  'Hajli, N., Baydarova, I., & Nisar, T. (2025). Digital entrepreneurial ecosystem. Entrepreneurship & Regional Development, 37(5–6).',
  'Hoang, H. (2024). Digital transformation adoption in SMEs. SAGE Open, 14(4). https://doi.org/10.1177/21582440241276198',
  'Instituto de Economía Social y Cooperativismo. (2024). Construcción de territorios solidarios en la Universidad Cooperativa de Colombia. Universidad Cooperativa de Colombia.',
  'Lietaer, B. (2001). The future of money: A new way to create wealth, work, and a wiser world. Random House.',
  'Nachira, F., Dini, P., & Nicolai, A. (2007). A network of digital business ecosystems for Europe: Roots, processes and perspectives. En F. Nachira et al. (Eds.), Digital business ecosystems. European Commission.',
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Wordmark />
        <p>
          Moneda digital comunitaria para ecosistemas solidarios universitarios. Prototipo académico de código abierto.
        </p>
        <p className="footer__fine">
          Demo con datos y personas de ejemplo · cifras financieras estimadas · el ECO no es un activo para especular.
        </p>
        <details className="footer__refs">
          <summary>Referencias</summary>
          <ol>
            {REFS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </details>
      </div>
    </footer>
  );
}
