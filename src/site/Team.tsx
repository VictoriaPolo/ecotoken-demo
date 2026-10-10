const PEOPLE = [
  { name: 'Laura Victoria Polo Benavides', role: 'Ingeniería de Sistemas', mail: 'laura.polo@campusucc.edu.co' },
  { name: 'Jesús David Delgado Rey', role: 'Ingeniería Electrónica', mail: 'jesus.delgadorey@campusucc.edu.co' },
];

const REFS = [
  'Berardi, L., & Valentinetti, D. (2022). Digitalization of social impact for social economy organizations. Canadian Journal of Nonprofit and Social Economy Research, 13(2).',
  'Hajli, N., Baydarova, I., & Nisar, T. (2025). Digital entrepreneurial ecosystem. Entrepreneurship & Regional Development, 37(5–6).',
  'Hoang, H. (2024). Digital transformation adoption in SMEs. SAGE Open, 14(4). https://doi.org/10.1177/21582440241276198',
  'Instituto de Economía Social y Cooperativismo. (2024). Construcción de territorios solidarios en la Universidad Cooperativa de Colombia. Universidad Cooperativa de Colombia.',
  'Lietaer, B. (2001). The future of money: A new way to create wealth, work, and a wiser world. Random House.',
  'Nachira, F., Dini, P., & Nicolai, A. (2007). A network of digital business ecosystems for Europe: Roots, processes and perspectives. En F. Nachira et al. (Eds.), Digital business ecosystems. European Commission.',
];

const KEYWORDS = ['moneda comunitaria', 'economía solidaria', 'tokenización', 'ecosistemas digitales', 'innovación social', 'juventudes'];

export function Team() {
  return (
    <section className="section team" id="equipo" aria-labelledby="equipo-t">
      <header className="section__head">
        <p className="section__num">07 — Quiénes lo hacen</p>
        <h2 id="equipo-t">Jóvenes que usan la herramienta y también la construyen.</h2>
      </header>
      <div className="team__grid">
        <ul className="people">
          {PEOPLE.map((p) => (
            <li key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.role}</p>
              <a href={`mailto:${p.mail}`}>{p.mail}</a>
            </li>
          ))}
          <li>
            <h3>Pablo Elias Velasquez Perilla</h3>
            <p>Docente del semillero</p>
          </li>
        </ul>
        <div className="affil">
          <p>
            Semilleros de Investigación <b>OPENIN</b> y <b>SIFDSS</b>
            <br />
            Facultad de Ingenierías · Universidad Cooperativa de Colombia · Campus Bogotá
          </p>
          <p className="affil__event">
            <span>Presentado en</span>
            VI Encuentro Internacional de Economía Solidaria e Innovación Social · ESIS 2026
            <br />
            Santa Marta, Colombia · 27–30 de octubre de 2026
          </p>
          <ul className="tags tags--quiet">
            {KEYWORDS.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
      </div>
      <details className="refs">
        <summary>Referencias</summary>
        <ol>
          {REFS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </details>
    </section>
  );
}
