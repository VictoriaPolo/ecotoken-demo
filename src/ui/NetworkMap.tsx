import type { Member } from '../engine/types';

/** Posiciones fijas: el mismo "mapa del campus" en la portada y en el panel de impacto. */
const POS: Record<string, [number, number]> = {
  val: [118, 104],
  and: [306, 62],
  mar: [470, 128],
  jul: [438, 300],
  seb: [258, 372],
  tin: [92, 280],
  rai: [282, 214],
  rem: [492, 392],
  cam: [64, 404],
};

interface Props {
  members: Member[];
  links: { a: string; b: string; amount: number }[];
  isolated?: boolean;
  highlight?: string;
  compact?: boolean;
}

export function NetworkMap({ members, links, isolated = false, highlight, compact = false }: Props) {
  const max = Math.max(1, ...links.map((l) => l.amount));
  const volume = new Map<string, number>();
  for (const l of links) {
    volume.set(l.a, (volume.get(l.a) ?? 0) + l.amount);
    volume.set(l.b, (volume.get(l.b) ?? 0) + l.amount);
  }
  const vmax = Math.max(1, ...volume.values());
  return (
    <svg
      className={`netmap ${isolated ? 'is-isolated' : 'is-connected'} ${compact ? 'is-compact' : ''}`}
      viewBox="0 0 560 450"
      role="img"
      aria-label={
        isolated
          ? 'Mapa de actores sin conexiones entre sí'
          : `Mapa de ${links.length} relaciones de intercambio entre ${members.length} actores`
      }
    >
      <g className="netmap__links">
        {links.map((l) => {
          const [x1, y1] = POS[l.a] ?? [0, 0];
          const [x2, y2] = POS[l.b] ?? [0, 0];
          const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
          const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
          const hot = highlight && (l.a === highlight || l.b === highlight);
          return (
            <path
              key={`${l.a}-${l.b}`}
              d={`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`}
              strokeWidth={1 + (5 * l.amount) / max}
              className={hot ? 'is-hot' : ''}
            />
          );
        })}
      </g>
      {members.map((m) => {
        const [x, y] = POS[m.id] ?? [280, 220];
        const v = volume.get(m.id) ?? 0;
        const r = isolated ? 24 : 20 + (10 * v) / vmax;
        const org = m.role === 'organizacion';
        const lonely = !isolated && v === 0;
        return (
          <g
            key={m.id}
            transform={`translate(${x} ${y})`}
            className={`netmap__node ${org ? 'is-org' : ''} ${lonely ? 'is-lonely' : ''} ${highlight === m.id ? 'is-me' : ''}`}
          >
            {org ? <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={7} /> : <circle r={r} />}
            <text y="5" textAnchor="middle">
              {m.initials}
            </text>
            {isolated && (
              <g className="netmap__chat" transform={`translate(${r - 4} ${-r - 6})`}>
                <path d="M0 0h22a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H9l-5 5v-5H0a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Z" />
                <circle cx="5" cy="8" r="1.4" />
                <circle cx="11" cy="8" r="1.4" />
                <circle cx="17" cy="8" r="1.4" />
              </g>
            )}
            {!compact && (
              <text className="netmap__name" y={r + 17} textAnchor="middle">
                {org ? m.name : m.name.split(' ')[0]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
