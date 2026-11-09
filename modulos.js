// Lista de los modulos disponibles en la aplicacion.
const MODULOS = [
  {
    id: 'html',
    nombre: 'HTML5',
    descripcion: 'Estructura de páginas, etiquetas semánticas y formularios.',
    horas: 8,
    nivel: 'Básico',
    color: '#e8590c',
    requisitos: [], // No necesita otros modulos antes.
  },
  {
    id: 'git',
    nombre: 'Git y GitHub',
    descripcion: 'Guardar versiones de tu código y publicarlo.',
    horas: 4,
    nivel: 'Básico',
    color: '#495057',
    requisitos: [], // Se puede estudiar en cualquier momento.
  },
  {
    id: 'css',
    nombre: 'CSS',
    descripcion: 'Colores, tipografía, Flexbox y Grid.',
    horas: 10,
    nivel: 'Básico',
    color: '#1971c2',
    requisitos: ['html'], // Requiere completar HTML primero.
  },
  {
    id: 'js',
    nombre: 'JavaScript',
    descripcion: 'Variables, funciones, condicionales y arreglos.',
    horas: 12,
    nivel: 'Intermedio',
    color: '#e0a800',
    requisitos: ['html'],
  },
  {
    id: 'responsive',
    nombre: 'Diseño responsive',
    descripcion: 'Páginas que se ven bien en celular y computador.',
    horas: 6,
    nivel: 'Intermedio',
    color: '#0c8599',
    requisitos: ['css'],
  },
  {
    id: 'accesibilidad',
    nombre: 'Accesibilidad web',
    descripcion: 'Páginas que todas las personas pueden usar.',
    horas: 5,
    nivel: 'Intermedio',
    color: '#2f9e44',
    requisitos: ['html', 'css'], // Requiere completar dos modulos.
  },
  {
    id: 'dom',
    nombre: 'DOM y eventos',
    descripcion: 'Cambiar la página con JavaScript y reaccionar a clics.',
    horas: 8,
    nivel: 'Intermedio',
    color: '#9c36b5',
    requisitos: ['js'],
  },
  {
    id: 'fetch',
    nombre: 'Fetch y JSON',
    descripcion: 'Pedir y enviar datos a un servidor.',
    horas: 6,
    nivel: 'Avanzado',
    color: '#c2255c',
    requisitos: ['js'],
  },
  {
    id: 'apis',
    nombre: 'APIs del navegador',
    descripcion: 'Canvas, geolocalización, arrastrar y soltar, localStorage.',
    horas: 7,
    nivel: 'Avanzado',
    color: '#5f3dc4',
    requisitos: ['dom'],
  },
];

// Busca y devuelve un modulo usando su id.
function buscarModulo(id) {
  return MODULOS.find((m) => m.id === id);
}


// Lista de las insignias que se pueden ganar.
const INSIGNIAS = [
  {
    id: 'inicio',
    nombre: 'Primer paso',
    corto: 'Inicio',
    descripcion: 'Completa tu primer módulo.',
    minimo: 1,
  },
  {
    id: 'front',
    nombre: 'Front básico',
    corto: 'Front',
    descripcion: 'Completa HTML5 y CSS.',
    modulos: ['html', 'css'],
  },
  {
    id: 'programador',
    nombre: 'Programador JS',
    corto: 'JS',
    descripcion: 'Completa JavaScript y DOM y eventos.',
    modulos: ['js', 'dom'],
  },
  {
    id: 'diseno',
    nombre: 'Diseño para todos',
    corto: 'Diseño',
    descripcion: 'Completa Diseño responsive y Accesibilidad web.',
    modulos: ['responsive', 'accesibilidad'],
  },
  {
    id: 'meta',
    nombre: 'Ruta completa',
    corto: 'Meta',
    descripcion: 'Completa todos los módulos de tu ruta (mínimo 3).',
    todaLaRuta: true,
  },
];