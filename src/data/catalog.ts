import type { Activity, Category, Listing, Member, NodeConfig } from '../engine/types';

/** Parámetros iniciales del prototipo (artículo, tabla 2). La caducidad va de 30 a 90 días por nodo. */
export const DEFAULT_CONFIG: NodeConfig = {
  expiryDays: 90,
  walletCap: 500,
  inactivityDays: 60,
  penaltyPct: 10,
  retainedTo: 'fondo',
};

export const WELCOME_ECO = 50;

/** Personas de ejemplo. Ninguna corresponde a una persona u organización real. */
export const MEMBERS: Omit<Member, 'lots' | 'lastMoveDay' | 'lastPenaltyDay'>[] = [
  { id: 'val', name: 'Valentina Ríos', initials: 'VR', role: 'estudiante', occupation: 'Diseño gráfico · ilustraciones y logos', joinedDay: 1 },
  { id: 'and', name: 'Andrés Quintero', initials: 'AQ', role: 'estudiante', occupation: 'Ingeniería civil · tutor de cálculo', joinedDay: 1 },
  { id: 'mar', name: 'Mariana Ospina', initials: 'MO', role: 'estudiante', occupation: 'Lenguas modernas · traducciones', joinedDay: 1 },
  { id: 'jul', name: 'Julián Becerra', initials: 'JB', role: 'estudiante', occupation: 'Ingeniería de sistemas · desarrollo web', joinedDay: 1 },
  { id: 'seb', name: 'Sebastián Mora', initials: 'SM', role: 'estudiante', occupation: 'Emprendimiento · almuerzos caseros', joinedDay: 3 },
  { id: 'tin', name: 'Tinto Solidario', initials: 'TS', role: 'organizacion', occupation: 'Cooperativa estudiantil de café', joinedDay: 1 },
  { id: 'rai', name: 'Colectivo Raíz', initials: 'CR', role: 'organizacion', occupation: 'Organización ESS · agroecología y formación', joinedDay: 1 },
  { id: 'rem', name: 'Taller Remiendo', initials: 'TR', role: 'organizacion', occupation: 'Moda circular y reparación de ropa', joinedDay: 10 },
  { id: 'cam', name: 'Camila Herrera', initials: 'CH', role: 'estudiante', occupation: 'Música · clases de guitarra', joinedDay: 24, dormant: true },
];

export const LISTINGS: Listing[] = [
  { id: 'logo', sellerId: 'val', title: 'Diseño de logo', detail: 'Propuesta y dos ajustes, entrega en vector', price: 80, category: 'servicio', icon: 'pen' },
  { id: 'stickers', sellerId: 'val', title: 'Stickers ilustrados', detail: 'Paquete de 6, impresos en vinilo', price: 15, category: 'producto', icon: 'sticker' },
  { id: 'calculo', sellerId: 'and', title: 'Tutoría de cálculo', detail: '1 hora · límites, derivadas o integrales', price: 40, category: 'servicio', icon: 'calc' },
  { id: 'parcial', sellerId: 'and', title: 'Repaso grupal para parcial', detail: 'Hasta 4 personas · 2 horas', price: 60, category: 'servicio', icon: 'group' },
  { id: 'traduccion', sellerId: 'mar', title: 'Traducción de resumen al inglés', detail: 'Hasta 300 palabras, para artículos y ponencias', price: 35, category: 'servicio', icon: 'translate' },
  { id: 'landing', sellerId: 'jul', title: 'Landing page para tu emprendimiento', detail: 'Una página adaptable al celular, publicada', price: 120, category: 'servicio', icon: 'code' },
  { id: 'almuerzo', sellerId: 'seb', title: 'Almuerzo casero', detail: 'Menú del día, se recoge en la plazoleta', price: 20, category: 'producto', icon: 'bowl' },
  { id: 'tinto', sellerId: 'tin', title: 'Tinto y pandebono', detail: 'Canje en el punto de la cooperativa', price: 8, category: 'canje', icon: 'cup' },
  { id: 'cafe', sellerId: 'tin', title: 'Café tostado (250 g)', detail: 'Tostado y empacado por la cooperativa', price: 45, category: 'canje', icon: 'bean' },
  { id: 'taller', sellerId: 'rai', title: 'Taller de cooperativismo', detail: 'Evento · formación solidaria · 3 horas', price: 30, category: 'evento', icon: 'circle' },
  { id: 'canasta', sellerId: 'rai', title: 'Canasta agroecológica', detail: 'Verduras de la huerta del colectivo', price: 45, category: 'canje', icon: 'leaf' },
  { id: 'arreglo', sellerId: 'rem', title: 'Arreglo de ropa', detail: 'Dobladillos, cremalleras y parches', price: 18, category: 'servicio', icon: 'needle' },
  { id: 'guitarra', sellerId: 'cam', title: 'Clase de guitarra', detail: '1 hora · nivel inicial', price: 30, category: 'servicio', icon: 'guitar' },
];

export const ACTIVITIES: Activity[] = [
  { id: 'feria', title: 'Atender un puesto en la Feria ESS', detail: 'Se valida con el código del puesto', reward: 25, category: 'evento' },
  { id: 'huerta', title: 'Jornada de voluntariado en la huerta', detail: 'Con Colectivo Raíz · 4 horas', reward: 20, category: 'evento' },
  { id: 'mod1', title: 'Módulo: ¿qué es la economía solidaria?', detail: 'Formación solidaria · 40 min · una vez', reward: 30, category: 'formacion', once: true },
  { id: 'mod2', title: 'Módulo: cooperativas y finanzas solidarias', detail: 'Formación solidaria · 50 min · una vez', reward: 30, category: 'formacion', once: true },
  { id: 'referido', title: 'Vincular a un nuevo miembro', detail: 'Cuenta cuando hace su primer intercambio', reward: 15, category: 'evento' },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  servicio: 'Servicio',
  producto: 'Producto',
  evento: 'Evento',
  formacion: 'Formación',
  canje: 'Canje ESS',
};
