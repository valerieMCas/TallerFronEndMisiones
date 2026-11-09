// Cada biblioteca tiene
// id: nombre corto para identificarla
// nombre: lo que se muestra
// tipo: 'publica' o 'universitaria' (sirve para el filtro de preferencias)
// lat y lon: sus coordenadas (latitud y longitud), sacadas de Google Maps

// Lista de bibliotecas disponibles para buscar la mas cercana
const LUGARES = [
  {
    id: 'uam',
    nombre: 'Biblioteca Alfonso Borrero Cabal (UAM)',
    tipo: 'universitaria',
    lat: 5.06723,
    lon: -75.50294,
  },
  {
    id: 'unal',
    nombre: 'Biblioteca Alfonso Carvajal Escobar (U. Nacional, Palogrande)',
    tipo: 'universitaria',
    lat: 5.05574,
    lon: -75.49106,
  },
  {
    id: 'ucaldas',
    nombre: 'Biblioteca Universidad de Caldas (sede central)',
    tipo: 'universitaria',
    lat: 5.05538,
    lon: -75.49324,
  },
  {
    id: 'umanizales',
    nombre: 'Biblioteca Universidad de Manizales',
    tipo: 'universitaria',
    lat: 5.07668,
    lon: -75.51971,
  },
  {
    id: 'banrep',
    nombre: 'Biblioteca del Banco de la República (Centro Cultural)',
    tipo: 'publica',
    lat: 5.06696,
    lon: -75.51681,
  },
  {
    id: 'municipal',
    nombre: 'Biblioteca Pública Municipal',
    tipo: 'publica',
    lat: 5.06953,
    lon: -75.51829,
  },
  {
    id: 'caribe',
    nombre: 'Biblioteca satélite barrio El Caribe',
    tipo: 'publica',
    lat: 5.07351,
    lon: -75.49752,
  },
];