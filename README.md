# EcoToken · demo web

Demo interactiva de **EcoToken**, una moneda digital comunitaria de código abierto para que estudiantes,
emprendimientos y organizaciones de la economía social y solidaria (ESS) intercambien dentro de la universidad.

Proyecto de los Semilleros de Investigación OPENIN y SIFDSS, Universidad Cooperativa de Colombia, Campus Bogotá.
Presentado en el VI ESIS 2026 (Santa Marta, 27–30 de octubre de 2026).

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
  engine/   motor de reglas (caducidad, tope, inactividad), métricas y simulación
  data/     personas, ofertas y actividades de ejemplo, parámetros iniciales
  demo/     la plataforma simulada: billetera, marketplace, impacto, libro mayor, nodo
  site/     secciones de la página
  ui/       billete con guilloches, sellos, pictogramas y mapa de red
  styles/   estilos
```

## Autores

- Laura Victoria Polo Benavides · Ingeniería de Sistemas
- Jesús David Delgado Rey · Ingeniería Electrónica
- Docente del semillero: Pablo Elias Velasquez Perilla
