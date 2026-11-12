/**
 * Modelo financiero de EcoToken como negocio: los estudiantes no pagan; pagan las
 * universidades (licencia por nodo), los aliados comerciales y los patrocinadores.
 * Cifras mensuales en pesos colombianos. Simplificaciones: sin IVA, sin traslado de
 * pérdidas fiscales y con salarios que ya incluyen prestaciones.
 */
export interface Supuestos {
  nodosIniciales: number;
  nodosPorSemestre: number;
  licenciaMes: number;
  implementacion: number;
  aliadosPorNodo: number;
  membresiaAliado: number;
  retosPorMes: number;
  precioReto: number;
  hostingNodo: number;
  salarioSoporte: number;
  nodosPorSoporte: number;
  gastosAdmVentas: number;
  equipos: number;
  software: number;
  capitalTrabajo: number;
  pctDeuda: number;
  tasaEA: number;
  plazoMeses: number;
  diasCartera: number;
  diasProveedores: number;
  tasaRenta: number;
}

export const SUPUESTOS: Supuestos = {
  nodosIniciales: 1,
  nodosPorSemestre: 2,
  licenciaMes: 1_800_000,
  implementacion: 5_000_000,
  aliadosPorNodo: 6,
  membresiaAliado: 120_000,
  retosPorMes: 1,
  precioReto: 1_500_000,
  hostingNodo: 300_000,
  salarioSoporte: 2_600_000,
  nodosPorSoporte: 5,
  gastosAdmVentas: 5_500_000,
  equipos: 8_000_000,
  software: 15_000_000,
  capitalTrabajo: 45_000_000,
  pctDeuda: 0.3,
  tasaEA: 0.18,
  plazoMeses: 36,
  diasCartera: 60,
  diasProveedores: 30,
  tasaRenta: 0.35,
};

/** Vida útil: equipos de cómputo a 5 años, software a 3 años. */
export const depreciacionMes = (s: Supuestos) => s.equipos / 60 + s.software / 36;

export interface Mes {
  mes: number;
  nodos: number;
  soporte: number;
  licencias: number;
  implementaciones: number;
  membresias: number;
  retos: number;
  ingresos: number;
  costoVentas: number;
  gastosAdm: number;
  depreciacion: number;
  intereses: number;
  impuesto: number;
  utilidadNeta: number;
  cobros: number;
  pagos: number;
  servicioDeuda: number;
  impuestoPagado: number;
  flujo: number;
  caja: number;
}

export interface Balance {
  efectivo: number;
  cartera: number;
  activosFijos: number;
  activos: number;
  deuda: number;
  proveedores: number;
  impuestoPorPagar: number;
  pasivos: number;
  aportes: number;
  utilidades: number;
  patrimonio: number;
}

export interface Proyeccion {
  meses: Mes[];
  inicial: Balance;
  final: Balance;
  cuota: number;
  prestamo: number;
  aportes: number;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function nodosEnMes(s: Supuestos, mes: number): number {
  return mes < 1 ? 0 : s.nodosIniciales + s.nodosPorSemestre * Math.floor((mes - 1) / 6);
}

export function proyectar(s: Supuestos, horizonte = 24): Proyeccion {
  const i = (1 + s.tasaEA) ** (1 / 12) - 1;
  const inversion = s.equipos + s.software + s.capitalTrabajo;
  const prestamo = inversion * s.pctDeuda;
  const aportes = inversion - prestamo;
  const cuota = prestamo === 0 ? 0 : i === 0 ? prestamo / s.plazoMeses : (prestamo * i) / (1 - (1 + i) ** -s.plazoMeses);
  const dep = depreciacionMes(s);
  const rezagoCobro = Math.round(s.diasCartera / 30);
  const rezagoPago = Math.round(s.diasProveedores / 30);

  let deuda = prestamo;
  let caja = s.capitalTrabajo;
  let utilidades = 0;
  let uaiAnio = 0;
  const impuestosPendientes: { pagarEn: number; valor: number }[] = [];
  const facturado: number[] = [];
  const hosting: number[] = [];
  const meses: Mes[] = [];

  for (let mes = 1; mes <= horizonte; mes++) {
    const nodos = nodosEnMes(s, mes);
    const nuevos = nodos - nodosEnMes(s, mes - 1);
    const soporte = Math.ceil(nodos / s.nodosPorSoporte);
    const licencias = nodos * s.licenciaMes;
    const implementaciones = nuevos * s.implementacion;
    const membresias = nodos * s.aliadosPorNodo * s.membresiaAliado;
    const retos = s.retosPorMes * s.precioReto;
    const ingresos = licencias + implementaciones + membresias + retos;
    const host = nodos * s.hostingNodo;
    const costoVentas = host + soporte * s.salarioSoporte;

    const intereses = deuda * i;
    const abono = mes <= s.plazoMeses ? Math.min(deuda, cuota - intereses) : 0;
    deuda -= abono;

    const uai = ingresos - costoVentas - s.gastosAdmVentas - dep - intereses;
    uaiAnio += uai;
    let impuesto = 0;
    if (mes % 12 === 0) {
      // La renta se liquida al cierre del año y se paga en abril del siguiente.
      impuesto = Math.max(0, uaiAnio) * s.tasaRenta;
      impuestosPendientes.push({ pagarEn: mes + 4, valor: impuesto });
      uaiAnio = 0;
    }
    const utilidadNeta = uai - impuesto;
    utilidades += utilidadNeta;

    facturado.push(ingresos);
    hosting.push(host);
    const cobros = facturado[mes - 1 - rezagoCobro] ?? 0;
    const pagos = (hosting[mes - 1 - rezagoPago] ?? 0) + soporte * s.salarioSoporte + s.gastosAdmVentas;
    const impuestoPagado = sum(impuestosPendientes.filter((p) => p.pagarEn === mes).map((p) => p.valor));
    const servicioDeuda = intereses + abono;
    const flujo = cobros - pagos - servicioDeuda - impuestoPagado;
    caja += flujo;

    meses.push({
      mes,
      nodos,
      soporte,
      licencias,
      implementaciones,
      membresias,
      retos,
      ingresos,
      costoVentas,
      gastosAdm: s.gastosAdmVentas,
      depreciacion: dep,
      intereses,
      impuesto,
      utilidadNeta,
      cobros,
      pagos,
      servicioDeuda,
      impuestoPagado,
      flujo,
      caja,
    });
  }

  const balance = (efectivo: number, cartera: number, fijos: number, deudaSaldo: number, prov: number, imp: number, util: number): Balance => ({
    efectivo,
    cartera,
    activosFijos: fijos,
    activos: efectivo + cartera + fijos,
    deuda: deudaSaldo,
    proveedores: prov,
    impuestoPorPagar: imp,
    pasivos: deudaSaldo + prov + imp,
    aportes,
    utilidades: util,
    patrimonio: aportes + util,
  });

  const pagados = new Set(meses.filter((m) => m.impuestoPagado > 0).map((m) => m.mes));
  return {
    meses,
    inicial: balance(s.capitalTrabajo, 0, s.equipos + s.software, prestamo, 0, 0, 0),
    final: balance(
      caja,
      sum(facturado.slice(facturado.length - rezagoCobro)),
      s.equipos + s.software - dep * horizonte,
      deuda,
      sum(hosting.slice(hosting.length - rezagoPago)),
      sum(impuestosPendientes.filter((p) => !pagados.has(p.pagarEn)).map((p) => p.valor)),
      utilidades,
    ),
    cuota,
    prestamo,
    aportes,
  };
}

export interface Anual {
  licencias: number;
  implementaciones: number;
  membresias: number;
  retos: number;
  ingresos: number;
  costoVentas: number;
  utilidadBruta: number;
  gastosAdm: number;
  depreciacion: number;
  utilidadOperacional: number;
  intereses: number;
  uai: number;
  impuesto: number;
  utilidadNeta: number;
  margenBruto: number;
  margenOperacional: number;
  margenNeto: number;
}

export function estadoResultados(meses: Mes[]): Anual {
  const t = (k: keyof Mes) => sum(meses.map((m) => m[k]));
  const ingresos = t('ingresos');
  const utilidadBruta = ingresos - t('costoVentas');
  const utilidadOperacional = utilidadBruta - t('gastosAdm') - t('depreciacion');
  const uai = utilidadOperacional - t('intereses');
  const utilidadNeta = uai - t('impuesto');
  const pct = (x: number) => (ingresos ? x / ingresos : 0);
  return {
    licencias: t('licencias'),
    implementaciones: t('implementaciones'),
    membresias: t('membresias'),
    retos: t('retos'),
    ingresos,
    costoVentas: t('costoVentas'),
    utilidadBruta,
    gastosAdm: t('gastosAdm'),
    depreciacion: t('depreciacion'),
    utilidadOperacional,
    intereses: t('intereses'),
    uai,
    impuesto: t('impuesto'),
    utilidadNeta,
    margenBruto: pct(utilidadBruta),
    margenOperacional: pct(utilidadOperacional),
    margenNeto: pct(utilidadNeta),
  };
}

/** Cuántos nodos (universidades) hacen falta para cubrir los costos fijos sin ganar ni perder. */
export function puntoEquilibrio(s: Supuestos) {
  const ingresoNodo = s.licenciaMes + s.aliadosPorNodo * s.membresiaAliado;
  const costoVariableNodo = s.hostingNodo + s.salarioSoporte / s.nodosPorSoporte;
  const margenNodo = ingresoNodo - costoVariableNodo;
  const costosFijos = s.gastosAdmVentas + depreciacionMes(s);
  const retos = s.retosPorMes * s.precioReto;
  const nodos = margenNodo > 0 ? Math.ceil(Math.max(0, costosFijos - retos) / margenNodo) : Infinity;
  return { ingresoNodo, costoVariableNodo, margenNodo, costosFijos, retos, nodos, ventasMes: nodos * ingresoNodo + retos };
}
