import type { ReactNode } from 'react';

const PATHS: Record<string, ReactNode> = {
  pen: (
    <>
      <path d="M12 21 6.5 10.5 12 3l5.5 7.5Z" />
      <path d="M12 21v-8.5" />
      <circle cx="12" cy="10.5" r="1.6" />
    </>
  ),
  sticker: (
    <>
      <path d="M5 4h10l4 4v12H5Z" />
      <path d="M15 4v4h4" />
      <path d="M9 14.5c1.6 1.7 4.4 1.7 6 0" />
      <path d="M9.5 11h.01M14.5 11h.01" strokeWidth="2.4" />
    </>
  ),
  calc: (
    <>
      <rect x="5.5" y="3" width="13" height="18" rx="1.5" />
      <path d="M8.5 6.5h7v3h-7Z" />
      <path d="M9 13h.01M12 13h.01M15 13h.01M9 16.5h.01M12 16.5h.01M15 16.5h.01" strokeWidth="2.2" />
    </>
  ),
  group: (
    <>
      <circle cx="12" cy="8" r="2.6" />
      <circle cx="5.5" cy="10" r="2" />
      <circle cx="18.5" cy="10" r="2" />
      <path d="M7.5 20c0-3 2-5 4.5-5s4.5 2 4.5 5M2.5 19c0-2.2 1.3-4 3-4M21.5 19c0-2.2-1.3-4-3-4" />
    </>
  ),
  translate: (
    <>
      <path d="M3 5h10v7H8l-3 3v-3H3Z" />
      <path d="M11 14v2h5l3 3v-3h2V9h-6" />
      <path d="M6 10.2 8 6.5l2 3.7M6.7 9h2.6" />
    </>
  ),
  code: (
    <>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
    </>
  ),
  bowl: (
    <>
      <path d="M3.5 12h17c0 4.5-3.8 7.5-8.5 7.5S3.5 16.5 3.5 12Z" />
      <path d="M9 4.5c-.8 1 .8 2-.1 3.2M12.5 3.5c-.8 1.2.8 2.2-.1 3.8M16 4.5c-.8 1 .8 2-.1 3.2" />
    </>
  ),
  cup: (
    <>
      <path d="M4.5 9h11v6.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4Z" />
      <path d="M15.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.5" />
      <path d="M8 3.5c-.7.9.7 1.7 0 2.8M11.5 3.5c-.7.9.7 1.7 0 2.8" />
    </>
  ),
  bean: (
    <>
      <ellipse cx="12" cy="12" rx="6" ry="8.5" transform="rotate(30 12 12)" />
      <path d="M15.6 5.6c-3.3 2-1.2 6.2-3.6 8.4-1.2 1.1-2.6 1.5-3.6 4" />
    </>
  ),
  circle: (
    <>
      <circle cx="12" cy="12" r="6.5" strokeDasharray="2.2 3" />
      <circle cx="12" cy="4.2" r="1.7" />
      <circle cx="19.4" cy="9.6" r="1.7" />
      <circle cx="16.6" cy="18.3" r="1.7" />
      <circle cx="7.4" cy="18.3" r="1.7" />
      <circle cx="4.6" cy="9.6" r="1.7" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C4 10 10 4 20 4c0 10-6 16-15 15Z" />
      <path d="M5 19 14 10M9.5 14.5h4M11.5 12.2V8.5" />
    </>
  ),
  needle: (
    <>
      <path d="M19.5 4.5 7 17l-2.5 2.5" />
      <path d="M17 5.2a1.3 1.3 0 1 1 1.8 1.8" />
      <path d="M18 6c-2 4-9 2.5-11 7-1 2.4.8 4.6 3.4 4" strokeDasharray="1.6 2" />
    </>
  ),
  guitar: (
    <>
      <path d="M13.2 10.8 19 5" />
      <path d="m18 3 3 3-1.5 1.5-3-3Z" />
      <path d="M10.6 9.4c-1.3-.6-3-.2-4 .9-.9.9-.8 2-1.6 2.6-1.1.7-2.3 1.3-2 3.3.4 2.3 3.6 5.5 5.9 5.9 2 .3 2.6-.9 3.3-2 .6-.8 1.7-.7 2.6-1.6 1.1-1 1.5-2.7.9-4" />
      <circle cx="9.7" cy="14.3" r="1.4" />
    </>
  ),
};

export function Pictogram({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.circle}
    </svg>
  );
}
