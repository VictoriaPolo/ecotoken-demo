import { describe, expect, it } from 'vitest';
import { estadoResultados, proyectar, puntoEquilibrio, SUPUESTOS } from './finance';

const cuadra = (b: { activos: number; pasivos: number; patrimonio: number }) =>
  expect(b.activos).toBeCloseTo(b.pasivos + b.patrimonio, 2);

describe('modelo financiero', () => {
  it('el balance cuadra: activo = pasivo + patrimonio', () => {
    const p = proyectar(SUPUESTOS);
    cuadra(p.inicial);
    cuadra(p.final);
    for (const pctDeuda of [0, 0.5, 0.8]) cuadra(proyectar({ ...SUPUESTOS, pctDeuda, diasCartera: 90 }).final);
  });

  it('respeta la estructura de capital elegida', () => {
    const p = proyectar(SUPUESTOS);
    expect(p.prestamo / (p.prestamo + p.aportes)).toBeCloseTo(0.3);
  });

  it('el estado de resultados suma igual que la utilidad acumulada', () => {
    const p = proyectar(SUPUESTOS);
    expect(estadoResultados(p.meses).utilidadNeta).toBeCloseTo(p.final.utilidades, 2);
  });

  it('cobrar más tarde no cambia la utilidad pero sí la caja', () => {
    const rapido = proyectar({ ...SUPUESTOS, diasCartera: 0 });
    const lento = proyectar({ ...SUPUESTOS, diasCartera: 90 });
    expect(estadoResultados(lento.meses).utilidadNeta).toBeCloseTo(estadoResultados(rapido.meses).utilidadNeta, 2);
    expect(Math.min(...lento.meses.map((m) => m.caja))).toBeLessThan(Math.min(...rapido.meses.map((m) => m.caja)));
  });

  it('en el punto de equilibrio la contribución cubre los costos fijos', () => {
    const pe = puntoEquilibrio(SUPUESTOS);
    expect(pe.nodos * pe.margenNodo + pe.retos).toBeGreaterThanOrEqual(pe.costosFijos);
    expect((pe.nodos - 1) * pe.margenNodo + pe.retos).toBeLessThan(pe.costosFijos);
  });
});
