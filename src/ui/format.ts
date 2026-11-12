const nf = new Intl.NumberFormat('es-CO');

export const num = (n: number) => nf.format(Math.round(n));
export const eco = (n: number) => `${nf.format(Math.round(n))} ECO`;
const nf1 = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Pesos: "$ 1,8 M" desde un millón, "$ 120.000" por debajo. */
export const cop = (n: number) => {
  const sign = n < 0 ? '−' : '';
  const a = Math.abs(n);
  return a >= 1e6 ? `${sign}$ ${nf1.format(a / 1e6)} M` : `${sign}$ ${nf.format(Math.round(a))}`;
};

/** Millones con un decimal y negativos entre paréntesis, como en los estados financieros. */
export const mill = (n: number) => (n < -5e4 ? `(${nf1.format(-n / 1e6)})` : nf1.format(Math.max(0, n) / 1e6));

export const pct =(n: number) => `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n * 100)} %`;
