# EcoToken · demo web

Demo interactiva de **EcoToken**, una moneda digital comunitaria de código abierto para que estudiantes,
emprendimientos y organizaciones de la economía social y solidaria (ESS) intercambien dentro de la universidad.

Incluye el modelo de negocio (cómo se sostiene sin cobrarle a los estudiantes) y un análisis contable interactivo,
para exponer el proyecto en clase.

## Qué hay en la demo

- **Portada y contexto**: el problema (actores aislados), la pregunta de investigación, el ciclo ganar → guardar → usar,
  el método en cuatro fases y el modelo federado.
- **Las tres reglas solidarias**, cada una con un simulador propio:
  - Caducidad (*demurrage*): los ECO sin usar vencen entre 30 y 90 días después de recibirlos.
  - Tope de billetera: máximo 500 ECO; el excedente pasa al fondo comunitario.
  - Inactividad: más de 60 días sin movimientos cuesta el 10 % del saldo cada mes.
- **La plataforma simulada**, con personas de ejemplo:
  - Billetera con saldo, tope, lotes y fecha de vencimiento de cada uno, transferencias y formas de ganar ECO.
  - Marketplace solidario (servicios, productos, eventos y canjes con organizaciones ESS).
  - Panel de impacto: intercambios, miembros activos, ECO en circulación, fondo comunitario, volumen semanal y red de
    intercambios.
  - Libro mayor con cada movimiento.
  - Parámetros del nodo, que se pueden cambiar para ver cómo interactúan las reglas.
  - Botones para adelantar el tiempo (+1 día, +1 semana, +1 mes) y ver actuar las reglas.
- **Modelo de negocio**: los estudiantes no pagan; los ingresos vienen de licencias por nodo (SaaS), implementación
  (réplica tipo franquicia), membresías de aliados (marketplace), retos patrocinados (ads), código abierto con nodo
  administrado (freemium) y descuentos por sede (venta por volumen).
- **Aspectos contables**: simulador a 24 meses con estado de resultados, márgenes bruto, operacional y neto, punto de
  equilibrio, flujo de caja y ciclo de conversión de efectivo, estructura de capital, balance (activo = pasivo +
  patrimonio), capacidad instalada e indicadores. Las cifras son estimaciones en pesos colombianos.

Todo corre en el navegador: no hay servidor, dinero real ni datos de personas reales. La historia inicial (80 días de
piloto) se genera con el mismo motor de reglas, así que lo emitido siempre cuadra con los saldos más el fondo.

> Los parámetros son los iniciales del prototipo y los resultados del proyecto son **esperados, no observados**: aún no
> hay datos de uso.

## Cómo correrla

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm test        # pruebas del motor de reglas
npm run build   # versión estática en dist/
```

El build usa rutas relativas, así que `dist/` se puede publicar en GitHub Pages, Render o cualquier hosting estático.

## Estructura

```
src/
  engine/   motor de reglas (caducidad, tope, inactividad), métricas, simulación y modelo financiero
  data/     personas, ofertas y actividades de ejemplo, parámetros iniciales
  demo/     la plataforma simulada: billetera, marketplace, impacto, libro mayor, nodo
  site/     secciones de la página
  ui/       billete con guilloches, sellos, pictogramas y mapa de red
  styles/   estilos
```
