import { useMemo } from 'react';

/** Roseta de guilloche: un círculo modulado por una onda, como en el fondo de los billetes. */
function rosette(cx: number, cy: number, r: number, amp: number, lobes: number, phase: number, steps = 360): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rr = r + amp * Math.sin(lobes * t + phase);
    const x = cx + rr * Math.cos(t);
    const y = cy + rr * Math.sin(t);
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + 'Z';
}

function wave(x0: number, x1: number, y: number, amp: number, period: number, phase: number): string {
  let d = '';
  for (let x = x0; x <= x1; x += 4) {
    const yy = y + amp * Math.sin((x / period) * Math.PI * 2 + phase);
    d += `${x === x0 ? 'M' : 'L'}${x} ${yy.toFixed(1)}`;
  }
  return d;
}

interface BanknoteProps {
  value: number;
  serial: string;
  className?: string;
  /** Sellos de circulación ya puestos (de 3). */
  stamped?: number;
}

export function Banknote({ value, serial, className = '', stamped = 1 }: BanknoteProps) {
  const art = useMemo(() => {
    const rings = Array.from({ length: 14 }, (_, i) => rosette(470, 168, 26 + i * 5.2, 6 + (i % 3) * 2, 18, i * 0.45));
    const inner = Array.from({ length: 6 }, (_, i) => rosette(470, 168, 10 + i * 2.6, 3.5, 9, i * 0.9, 180));
    const waves = Array.from({ length: 11 }, (_, i) => wave(0, 600, 208 + i * 7, 5, 70, i * 0.7));
    const top = Array.from({ length: 4 }, (_, i) => wave(0, 600, 22 + i * 5, 2.5, 38, i * 1.3));
    return { rings, inner, waves, top };
  }, []);

  const words: Record<number, string> = { 20: 'veinte', 50: 'cincuenta', 100: 'cien' };
  return (
    <svg className={`banknote ${className}`} viewBox="0 0 600 300" role="img" aria-label={`Billete ilustrativo de ${value} ECO`}>
      <defs>
        <clipPath id={`note-${serial}`}>
          <rect width="600" height="300" rx="14" />
        </clipPath>
        <radialGradient id={`glow-${serial}`} cx="0.75" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#246B4D" />
          <stop offset="1" stopColor="#0E3B2A" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#note-${serial})`}>
        <rect width="600" height="300" fill={`url(#glow-${serial})`} />
        <g fill="none" stroke="#8DC63F" strokeWidth="0.7" opacity="0.5">
          {art.rings.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g fill="none" stroke="#E2F0C8" strokeWidth="0.6" opacity="0.55">
          {art.inner.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g fill="none" stroke="#8DC63F" strokeWidth="0.6" opacity="0.28">
          {art.waves.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {art.top.map((d, i) => (
            <path key={`t${i}`} d={d} />
          ))}
        </g>
        <rect x="10" y="10" width="580" height="280" rx="9" fill="none" stroke="#B9DC7E" strokeOpacity="0.5" strokeDasharray="1 4" />

        <text x="34" y="48" className="bn-label">ECOTOKEN · NODO 001 · BOGOTÁ</text>
        <text x="34" y="150" className="bn-value">{value}</text>
        <text x={value >= 100 ? 222 : 160} y="150" className="bn-unit">ECO</text>
        <text x="34" y="182" className="bn-legend">
          Vale por {words[value] ?? value} ECO entre estudiantes,
        </text>
        <text x="34" y="200" className="bn-legend">
          emprendimientos y organizaciones solidarias.
        </text>
        <text x="566" y="48" textAnchor="end" className="bn-serial">
          N.º {serial}
        </text>

        {['30 d', '60 d', '90 d'].map((label, i) => (
          <g key={label} transform={`translate(${34 + i * 64} 226)`}>
            <rect width="54" height="48" rx="4" fill="none" stroke="#E2F0C8" strokeOpacity="0.7" strokeDasharray="3 3" />
            <text x="27" y="42" textAnchor="middle" className="bn-box">
              {label}
            </text>
            {i < stamped && (
              <g transform="translate(27 20) rotate(-14)">
                <circle r="15" fill="none" stroke="#E56B47" strokeWidth="2.2" />
                <text y="3.5" textAnchor="middle" className="bn-stampmark">
                  CIRCULÓ
                </text>
              </g>
            )}
          </g>
        ))}
        <text x="232" y="266" className="bn-small">
          Si no circula, caduca.
        </text>
      </g>
    </svg>
  );
}
