const nf = new Intl.NumberFormat('es-CO');

export const num = (n: number) => nf.format(Math.round(n));
export const eco = (n: number) => `${nf.format(Math.round(n))} ECO`;
export const pct = (n: number) => `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n * 100)} %`;
