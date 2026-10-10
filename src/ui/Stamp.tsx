import { useId } from 'react';

interface StampProps {
  ring: string;
  big: string;
  small?: string;
  tone?: 'stamp' | 'forest' | 'lime';
  rotate?: number;
  size?: number;
  className?: string;
}

/** Sello de goma: texto en círculo, borde doble y una textura que imita la tinta irregular. */
export function Stamp({ ring, big, small, tone = 'stamp', rotate = -8, size = 168, className = '' }: StampProps) {
  const id = useId().replace(/:/g, '');
  const text = `${ring} · `.repeat(Math.max(1, Math.round(44 / (ring.length + 3))));
  return (
    <svg
      className={`stamp stamp--${tone} ${className}`}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotate}deg)` }}
      role="img"
      aria-label={`${ring}: ${big} ${small ?? ''}`}
    >
      <defs>
        <filter id={`ink-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.7" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" result="inked" />
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="8" result="warp" />
          <feDisplacementMap in="inked" in2="warp" scale="3" />
        </filter>
        <path id={`ring-${id}`} d="M100 100m-72 0a72 72 0 1 1 144 0a72 72 0 1 1-144 0" />
      </defs>
      <g filter={`url(#ink-${id})`} fill="currentColor" stroke="currentColor">
        <circle cx="100" cy="100" r="94" fill="none" strokeWidth="5" />
        <circle cx="100" cy="100" r="86" fill="none" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="56" fill="none" strokeWidth="1.5" />
        <text className="stamp__ring" stroke="none">
          <textPath href={`#ring-${id}`} textLength="440" lengthAdjust="spacing">
            {text.toUpperCase()}
          </textPath>
        </text>
        <text className="stamp__big" x="100" y={small ? 104 : 114} textAnchor="middle" stroke="none">
          {big}
        </text>
        {small && (
          <text className="stamp__small" x="100" y="128" textAnchor="middle" stroke="none">
            {small.toUpperCase()}
          </text>
        )}
      </g>
    </svg>
  );
}
