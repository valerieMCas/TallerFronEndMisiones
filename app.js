
// RutaUAM

// Referencias a los elementos del HTML
const listaCatalogo = document.getElementById('lista-catalogo');
const zonaCatalogo = document.getElementById('catalogo');
const zonaRuta = document.getElementById('zona-ruta');
const listaRuta = document.getElementById('lista-ruta');
const rutaVacia = document.getElementById('ruta-vacia');
const contadorRuta = document.getElementById('contador-ruta');
const aviso = document.getElementById('aviso');
const estimado = document.getElementById('estimado');
const resumenProgreso = document.getElementById('resumen-progreso');
const lienzo = document.getElementById('lienzo');
const formPerfil = document.getElementById('form-perfil');
const inputNombre = document.getElementById('nombre');
const inputMeta = document.getElementById('meta');
const saludo = document.getElementById('saludo');
const selectTipo = document.getElementById('tipo-biblioteca');
const btnUbicacion = document.getElementById('btn-ubicacion');
const estadoUbicacion = document.getElementById('estado-ubicacion');
const datosUbicacion = document.getElementById('datos-ubicacion');
const textoCoordenadas = document.getElementById('coordenadas');
const enlaceMapa = document.getElementById('enlace-mapa');
const tituloBiblioteca = document.getElementById('titulo-biblioteca');
const textoBiblioteca = document.getElementById('biblioteca-cercana');
const enlaceComoLlegar = document.getElementById('como-llegar');
const listaOtras = document.getElementById('otras-bibliotecas');
const btnReiniciar = document.getElementById('btn-reiniciar');


// Constantes y datos del usuario
const CLAVE_STORAGE = 'rutaUAM';
const MAX_MODULOS = 7;
const RADIO_BIBLIOTECA_KM = 0.15;
const VELOCIDAD_CAMINANDO_KMH = 4.5;

// Estados de cada modulo
const TEXTO_ESTADO = {
  pendiente: 'Pendiente',
  curso: 'En curso',
  completado: 'Completado',
};

// Datos del usuario
let perfil = { nombre: '', meta: null, tipoBiblioteca: 'todas' };
let ruta = [];
let ubicacion = null;


// Guarda los datos en localStorage
function guardarLocal() {
  const datos = {
    perfil: perfil,
    ruta: ruta,
    ubicacion: ubicacion,
  };
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
}

// Carga los datos guardados
function cargarLocal() {
  const texto = localStorage.getItem(CLAVE_STORAGE);
  if (!texto) return;

  try {
    const datos = JSON.parse(texto);

    if (datos.perfil) {
      perfil.nombre = datos.perfil.nombre || '';
      perfil.meta = datos.perfil.meta || null;
      perfil.tipoBiblioteca = datos.perfil.tipoBiblioteca || 'todas';
    }

    if (Array.isArray(datos.ruta)) {
      // Deja solo los modulos y estados validos
      ruta = datos.ruta.filter((item) => buscarModulo(item.id) && TEXTO_ESTADO[item.estado]);

      // Reinicia la ruta si no cumple las condiciones
      if (ruta.length > MAX_MODULOS || errorDeOrden(idsDeRuta())) ruta = [];
    }

    if (datos.ubicacion) ubicacion = datos.ubicacion;
  } catch {
    // Borra los datos si tienen un error
    localStorage.removeItem(CLAVE_STORAGE);
  }
}


// Funciones para trabajar con los modulos
function nombreDe(id) {
  return buscarModulo(id).nombre;
}

function idsDeRuta() {
  return ruta.map((item) => item.id);
}

function buscarEnRuta(id) {
  return ruta.find((item) => item.id === id);
}

// Une varios nombres en un texto
function unirNombres(lista) {
  if (lista.length <= 1) return lista.join('');
  return lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1];
}

// Revisa que los requisitos esten antes de cada modulo
function errorDeOrden(ids) {
  for (let i = 0; i < ids.length; i++) {
    const modulo = buscarModulo(ids[i]);

    for (const requisito of modulo.requisitos) {
      const posicion = ids.indexOf(requisito);

      if (posicion === -1) {
        return `${modulo.nombre} necesita ${nombreDe(requisito)}. Agrega primero ${nombreDe(requisito)} a tu ruta.`;
      }

      if (posicion > i) {
        return `${modulo.nombre} tiene que ir después de ${nombreDe(requisito)}, porque lo necesita.`;
      }
    }
  }
  return null;
}

// Mueve un modulo a otra posicion
function moverEnLista(ids, id, posicion) {
  const copia = ids.slice();
  const desde = copia.indexOf(id);
  copia.splice(desde, 1);
  const destino = posicion > desde ? posicion - 1 : posicion;
  copia.splice(destino, 0, id);
  return copia;
}

// Revisa si se puede agregar un modulo
function validarAgregar(id, posicion) {
  if (buscarEnRuta(id)) return `${nombreDe(id)} ya está en tu ruta.`;

  if (ruta.length >= MAX_MODULOS) {
    return `Tu ruta ya tiene ${MAX_MODULOS} módulos. Termina o quita alguno antes de agregar más.`;
  }

  const ids = idsDeRuta();
  ids.splice(posicion, 0, id);
  return errorDeOrden(ids);
}

// Revisa si se puede quitar un modulo
function validarQuitar(id) {
  const dependientes = ruta
    .filter((item) => buscarModulo(item.id).requisitos.includes(id))
    .map((item) => nombreDe(item.id));

  if (dependientes.length > 0) {
    const verbo = dependientes.length > 1 ? 'necesitan' : 'necesita';
    return `No puedes quitar ${nombreDe(id)} porque ${unirNombres(dependientes)} lo ${verbo}.`;
  }

  return null;
}

// Revisa si un modulo puede empezar
function validarEmpezar(id) {
  const otro = ruta.find((item) => item.estado === 'curso' && item.id !== id);

  if (otro) {
    return `Ya estás estudiando ${nombreDe(otro.id)}. Termínalo o páusalo antes de empezar otro.`;
  }

  const faltan = buscarModulo(id).requisitos.filter((requisito) => {
    const enRuta = buscarEnRuta(requisito);
    return !enRuta || enRuta.estado !== 'completado';
  });

  if (faltan.length > 0) {
    return `Para empezar ${nombreDe(id)} primero completa ${unirNombres(faltan.map(nombreDe))}.`;
  }

  return null;
}

// Revisa si un modulo puede volver a abrirse
function validarReabrir(id) {
  const avanzados = ruta
    .filter((item) => item.estado !== 'pendiente' && buscarModulo(item.id).requisitos.includes(id))
    .map((item) => nombreDe(item.id));

  if (avanzados.length > 0) {
    return `No puedes reabrir ${nombreDe(id)} porque ya avanzaste en ${unirNombres(avanzados)}.`;
  }

  return null;
}

// Busca el siguiente modulo que se puede empezar
function siguienteRecomendado() {
  if (ruta.some((item) => item.estado === 'curso')) return null;

  const siguiente = ruta.find(
    (item) => item.estado === 'pendiente' && validarEmpezar(item.id) === null
  );

  return siguiente ? siguiente.id : null;
}

// Revisa si una insignia fue ganada
function ganoInsignia(insignia) {
  const completados = ruta
    .filter((item) => item.estado === 'completado')
    .map((item) => item.id);

  if (insignia.minimo) return completados.length >= insignia.minimo;
  if (insignia.modulos) return insignia.modulos.every((id) => completados.includes(id));
  if (insignia.todaLaRuta) return ruta.length >= 3 && completados.length === ruta.length;

  return false;
}

function insigniasGanadas() {
  return INSIGNIAS.filter(ganoInsignia);
}

// Valida el nombre del usuario
function validarNombre(valor) {
  const texto = valor.trim();

  if (!texto) return 'Escribe tu nombre.';
  if (texto.length < 2) return 'Usa al menos 2 letras.';
  if (texto.length > 30) return 'Usa máximo 30 caracteres.';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(texto)) return 'Usa solo letras y espacios.';

  return null;
}

// Valida las horas de estudio
function validarMeta(valor) {
  if (valor.trim() === '') return 'Escribe cuántas horas puedes estudiar.';

  const horas = Number(valor);

  if (!Number.isInteger(horas)) return 'Escribe un número entero de horas.';
  if (horas < 2) return 'Mínimo 2 horas a la semana para avanzar.';
  if (horas > 40) return 'Máximo 40 horas: también hay que descansar.';

  return null;
}


// Guarda los cambios y actualiza la pagina
function actualizarTodo() {
  guardarLocal();
  pintarTodo();
}

// Agrega un modulo a la ruta
function agregar(id, posicion = ruta.length) {
  const error = validarAgregar(id, posicion);

  if (error) return mostrarAviso(error, 'error');

  ruta.splice(posicion, 0, { id: id, estado: 'pendiente' });
  actualizarTodo();
  mostrarAviso(`Agregaste ${nombreDe(id)} a tu ruta.`, 'ok');
}

// Cambia un modulo de posicion
function mover(id, posicion) {
  const ids = idsDeRuta();
  const nuevos = moverEnLista(ids, id, posicion);

  if (nuevos.join() === ids.join()) return;

  const error = errorDeOrden(nuevos);

  if (error) return mostrarAviso(error, 'error');

  ruta = nuevos.map((nuevoId) => buscarEnRuta(nuevoId));
  actualizarTodo();
}

// Quita un modulo de la ruta
function quitar(id) {
  const error = validarQuitar(id);

  if (error) return mostrarAviso(error, 'error');

  ruta = ruta.filter((item) => item.id !== id);
  actualizarTodo();
  mostrarAviso(`Quitaste ${nombreDe(id)} de tu ruta.`, 'ok');
}

// Cambia el estado de un modulo
function cambiarEstado(id, accion) {
  const item = buscarEnRuta(id);
  const cuantasAntes = insigniasGanadas().length;

  let error = null;

  if (accion === 'empezar') error = validarEmpezar(id);
  if (accion === 'reabrir') error = validarReabrir(id);
  if (error) return mostrarAviso(error, 'error');

  if (accion === 'empezar') item.estado = 'curso';
  if (accion === 'pausar') item.estado = 'pendiente';
  if (accion === 'completar') item.estado = 'completado';
  if (accion === 'reabrir') item.estado = 'pendiente';

  actualizarTodo();

  if (accion !== 'completar') return;

  const ganadas = insigniasGanadas();

  if (ganadas.length > cuantasAntes) {
    const nueva = ganadas[ganadas.length - 1];
    mostrarAviso(
      `¡Completaste ${nombreDe(id)} y ganaste la insignia «${nueva.nombre}»!`,
      'ok'
    );
  } else {
    mostrarAviso(`¡Bien! Completaste ${nombreDe(id)}.`, 'ok');
  }
}


// Muestra un mensaje temporal
let temporizadorAviso = null;

function mostrarAviso(texto, tipo) {
  aviso.textContent = texto;
  aviso.className = 'aviso visible ' + tipo;

  clearTimeout(temporizadorAviso);

  temporizadorAviso = setTimeout(() => {
    aviso.className = 'aviso';
  }, 5000);
}


// Actualiza todos los elementos de la pagina
function pintarTodo() {
  pintarCatalogo();
  pintarRuta();
  pintarResumen();
  dibujarProgreso();
  pintarUbicacion();
}

// Crea un elemento del HTML
function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;

  return elemento;
}

// Crea un boton con una accion
function crearBoton(texto, clase, descripcion, alHacerClic) {
  const boton = crearElemento('button', clase, texto);

  boton.type = 'button';
  boton.title = descripcion;
  boton.setAttribute('aria-label', descripcion);
  boton.addEventListener('click', alHacerClic);

  return boton;
}

// Muestra las tarjetas de los modulos
function pintarCatalogo() {
  listaCatalogo.innerHTML = '';

  MODULOS.forEach((modulo) => {
    const enRuta = buscarEnRuta(modulo.id) !== undefined;
    const faltan = modulo.requisitos.filter((requisito) => !buscarEnRuta(requisito));

    const tarjeta = crearElemento('article', 'tarjeta-modulo');
    tarjeta.dataset.id = modulo.id;
    tarjeta.style.setProperty('--color-modulo', modulo.color);

    if (enRuta) tarjeta.classList.add('en-ruta');

    // Permite arrastrar las tarjetas
    tarjeta.draggable = !enRuta;
    tarjeta.addEventListener('dragstart', (e) => alEmpezarArrastre(e, modulo.id));
    tarjeta.addEventListener('dragend', alTerminarArrastre);

    const cabeza = crearElemento('div', 'tarjeta-cabeza');
    cabeza.appendChild(crearElemento('span', 'nivel', modulo.nivel));
    cabeza.appendChild(crearElemento('span', 'horas', modulo.horas + ' h'));

    let textoRequisitos = 'Sin requisitos';

    if (modulo.requisitos.length > 0) {
      textoRequisitos = 'Necesita: ' + unirNombres(modulo.requisitos.map(nombreDe));
    }

    const requisitos = crearElemento('p', 'requisitos', textoRequisitos);

    if (faltan.length > 0 && !enRuta) requisitos.classList.add('faltan');

    const boton = crearBoton(
      enRuta ? 'En tu ruta ✓' : 'Agregar',
      'btn pequeno',
      enRuta
        ? modulo.nombre + ' ya está en tu ruta'
        : 'Agregar ' + modulo.nombre + ' a mi ruta',
      () => agregar(modulo.id),
    );

    boton.disabled = enRuta;

    tarjeta.appendChild(cabeza);
    tarjeta.appendChild(crearElemento('h3', '', modulo.nombre));
    tarjeta.appendChild(crearElemento('p', 'descripcion', modulo.descripcion));
    tarjeta.appendChild(requisitos);
    tarjeta.appendChild(boton);

    listaCatalogo.appendChild(tarjeta);
  });
}

// Muestra los modulos de la ruta
function pintarRuta() {
  listaRuta.innerHTML = '';
  rutaVacia.hidden = ruta.length > 0;
  contadorRuta.textContent = `${ruta.length} / ${MAX_MODULOS} módulos`;
  contadorRuta.classList.toggle('lleno', ruta.length >= MAX_MODULOS);

  const recomendado = siguienteRecomendado();

  ruta.forEach((item, posicion) => {
    const modulo = buscarModulo(item.id);
    const paso = crearElemento('li', 'paso estado-' + item.estado);

    paso.dataset.id = item.id;
    paso.style.setProperty('--color-modulo', modulo.color);

    if (item.id === recomendado) paso.classList.add('recomendado');

    // Permite mover los modulos arrastrandolos
    paso.draggable = true;
    paso.addEventListener('dragstart', (e) => alEmpezarArrastre(e, item.id));
    paso.addEventListener('dragend', alTerminarArrastre);

    const numero = crearElemento(
      'span',
      'numero',
      item.estado === 'completado' ? '✓' : String(posicion + 1)
    );

    numero.setAttribute('aria-hidden', 'true');

    const info = crearElemento('div', 'paso-info');
    info.appendChild(crearElemento('strong', '', modulo.nombre));
    info.appendChild(
      crearElemento(
        'span',
        'paso-detalle',
        `${modulo.horas} horas, nivel ${modulo.nivel.toLowerCase()}`
      )
    );

    if (item.id === recomendado) {
      info.appendChild(
        crearElemento('span', 'etiqueta-siguiente', 'Siguiente recomendado')
      );
    }

    const etiqueta = crearElemento(
      'span',
      'etiqueta-estado ' + item.estado,
      TEXTO_ESTADO[item.estado]
    );

    // Crea los botones segun el estado
    const acciones = crearElemento('div', 'paso-acciones');

    if (item.estado === 'pendiente') {
      acciones.appendChild(
        crearBoton(
          'Empezar',
          'btn pequeno secundario',
          'Empezar ' + modulo.nombre,
          () => cambiarEstado(item.id, 'empezar')
        )
      );
    }

    if (item.estado === 'curso') {
      acciones.appendChild(
        crearBoton(
          'Completar',
          'btn pequeno',
          'Completar ' + modulo.nombre,
          () => cambiarEstado(item.id, 'completar')
        )
      );

      acciones.appendChild(
        crearBoton(
          'Pausar',
          'btn pequeno secundario',
          'Pausar ' + modulo.nombre,
          () => cambiarEstado(item.id, 'pausar')
        )
      );
    }

    if (item.estado === 'completado') {
      acciones.appendChild(
        crearBoton(
          'Reabrir',
          'btn pequeno secundario',
          'Reabrir ' + modulo.nombre,
          () => cambiarEstado(item.id, 'reabrir')
        )
      );
    }

    // Permite cambiar el orden con botones
    const subir = crearBoton(
      '↑',
      'btn icono',
      'Subir ' + modulo.nombre,
      () => mover(item.id, posicion - 1)
    );

    subir.disabled = posicion === 0;

    const bajar = crearBoton(
      '↓',
      'btn icono',
      'Bajar ' + modulo.nombre,
      () => mover(item.id, posicion + 2)
    );

    bajar.disabled = posicion === ruta.length - 1;

    const botonQuitar = crearBoton(
      '✕',
      'btn icono quitar',
      'Quitar ' + modulo.nombre + ' de mi ruta',
      () => quitar(item.id)
    );

    acciones.appendChild(subir);
    acciones.appendChild(bajar);
    acciones.appendChild(botonQuitar);

    paso.appendChild(numero);
    paso.appendChild(info);
    paso.appendChild(etiqueta);
    paso.appendChild(acciones);

    listaRuta.appendChild(paso);
  });
}

// Calcula las horas y el porcentaje de progreso
function calcularHoras() {
  let total = 0;
  let hechas = 0;

  ruta.forEach((item) => {
    const horas = buscarModulo(item.id).horas;
    total += horas;

    if (item.estado === 'completado') hechas += horas;
  });

  const porcentaje = total > 0 ? Math.round((hechas / total) * 100) : 0;

  return {
    total: total,
    hechas: hechas,
    porcentaje: porcentaje,
  };
}

// Muestra el resumen del progreso
function pintarResumen() {
  const { total, hechas, porcentaje } = calcularHoras();

  const completados = ruta.filter(
    (item) => item.estado === 'completado'
  ).length;

  if (ruta.length === 0) {
    resumenProgreso.textContent = 'Agrega módulos para ver tu avance.';
    estimado.textContent = '';
    return;
  }

  resumenProgreso.textContent =
    `Llevas ${porcentaje}%: ${completados} de ${ruta.length} módulos completados y ` +
    `${insigniasGanadas().length} de ${INSIGNIAS.length} insignias.`;

  // Calcula el tiempo estimado segun las horas del usuario
  const faltan = total - hechas;

  if (faltan === 0) {
    estimado.textContent = `Tu ruta suma ${total} horas y ya las completaste todas.`;
  } else if (!perfil.meta) {
    estimado.textContent =
      `Te faltan ${faltan} horas. Guarda tus horas por semana en el perfil para saber cuándo terminas.`;
  } else {
    const semanas = Math.ceil(faltan / perfil.meta);

    estimado.textContent =
      `Te faltan ${faltan} horas. Estudiando ${perfil.meta} h por semana, ` +
      `terminas en ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}.`;
  }
}


// Funciones para arrastrar y soltar modulos
function alEmpezarArrastre(e, id) {
  e.dataTransfer.setData('text/plain', id);
  e.currentTarget.classList.add('arrastrando');
}

// Limpia las marcas al terminar de arrastrar
function alTerminarArrastre(e) {
  e.currentTarget.classList.remove('arrastrando');
  zonaRuta.classList.remove('encima');
  zonaCatalogo.classList.remove('encima');
  quitarMarcaDePasos();
}

// Quita las marcas de los pasos
function quitarMarcaDePasos() {
  listaRuta
    .querySelectorAll('.paso.encima')
    .forEach((paso) => paso.classList.remove('encima'));
}

// Permite soltar modulos en la ruta
zonaRuta.addEventListener('dragover', (e) => {
  e.preventDefault();
  zonaRuta.classList.add('encima');

  quitarMarcaDePasos();

  const pasoDebajo = e.target.closest('.paso');

  if (pasoDebajo) pasoDebajo.classList.add('encima');
});

// Quita la marca al salir de la zona
zonaRuta.addEventListener('dragleave', () => {
  zonaRuta.classList.remove('encima');
  quitarMarcaDePasos();
});

// Agrega o mueve un modulo al soltarlo
zonaRuta.addEventListener('drop', (e) => {
  e.preventDefault();
  zonaRuta.classList.remove('encima');
  quitarMarcaDePasos();

  const id = e.dataTransfer.getData('text/plain');

  if (!buscarModulo(id)) return;

  let posicion = ruta.length;
  const pasoDestino = e.target.closest('.paso');

  if (pasoDestino) {
    posicion = idsDeRuta().indexOf(pasoDestino.dataset.id);

    const desde = idsDeRuta().indexOf(id);

    if (desde !== -1 && desde < posicion) {
      posicion = posicion + 1;
    }
  }

  if (buscarEnRuta(id)) {
    mover(id, posicion);
  } else {
    agregar(id, posicion);
  }
});

// Permite quitar un modulo al soltarlo en el catalogo
zonaCatalogo.addEventListener('dragover', (e) => {
  e.preventDefault();
  zonaCatalogo.classList.add('encima');
});

zonaCatalogo.addEventListener('dragleave', () => {
  zonaCatalogo.classList.remove('encima');
});

zonaCatalogo.addEventListener('drop', (e) => {
  e.preventDefault();
  zonaCatalogo.classList.remove('encima');

  const id = e.dataTransfer.getData('text/plain');

  if (buscarEnRuta(id)) quitar(id);
});


// Colores y fuentes para el canvas
const COLOR = {
  tinta: '#1f3c88',
  lapiz: '#2b303b',
  lapizSuave: '#5f6775',
  hoja: '#e7edf5',
  pendiente: '#d5dde8',
  verde: '#2b7a4b',
  dorado: '#e0a100',
};

const LETRA_MANO = "'Kalam', 'Comic Sans MS', cursive";
const LETRA_TEXTO = "'Atkinson Hyperlegible', system-ui, sans-serif";
const ALTO_LIENZO = 345;

// Dibuja el progreso en el canvas
function dibujarProgreso() {
  const ctx = lienzo.getContext('2d');

  // Ajusta el tamaño para que el dibujo no se vea borroso
  const ancho = lienzo.clientWidth || 300;
  const escala = window.devicePixelRatio || 1;

  lienzo.width = ancho * escala;
  lienzo.height = ALTO_LIENZO * escala;

  ctx.scale(escala, escala);

  const { total, hechas, porcentaje } = calcularHoras();

  // Dibuja el anillo del porcentaje
  const centroX = ancho / 2;
  const centroY = 70;
  const radio = 54;

  ctx.lineWidth = 14;
  ctx.lineCap = 'round';

  ctx.strokeStyle = COLOR.hoja;
  ctx.beginPath();
  ctx.arc(centroX, centroY, radio, 0, Math.PI * 2);
  ctx.stroke();

  if (porcentaje > 0) {
    const inicio = -Math.PI / 2;
    const fin = inicio + (Math.PI * 2 * porcentaje) / 100;

    ctx.strokeStyle =
      porcentaje === 100 ? COLOR.verde : COLOR.tinta;

    ctx.beginPath();
    ctx.arc(centroX, centroY, radio, inicio, fin);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLOR.tinta;
  ctx.font = 'bold 30px ' + LETRA_MANO;
  ctx.fillText(porcentaje + '%', centroX, centroY - 6);

  ctx.fillStyle = COLOR.lapizSuave;
  ctx.font = '12px ' + LETRA_TEXTO;
  ctx.fillText('completado', centroX, centroY + 18);

  // Dibuja la barra de modulos
  const xBarra = 12;
  const yBarra = 170;
  const anchoBarra = ancho - 24;
  const altoBarra = 24;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLOR.tinta;
  ctx.font = 'bold 16px ' + LETRA_MANO;
  ctx.fillText('Tu ruta, módulo por módulo', xBarra, yBarra - 10);

  ctx.fillStyle = COLOR.hoja;
  ctx.fillRect(xBarra, yBarra, anchoBarra, altoBarra);

  let x = xBarra;

  ruta.forEach((item) => {
    const modulo = buscarModulo(item.id);
    const anchoPedazo = (modulo.horas / total) * anchoBarra;

    if (item.estado === 'completado') {
      ctx.fillStyle = modulo.color;
    } else if (item.estado === 'curso') {
      ctx.fillStyle = modulo.color;
      ctx.globalAlpha = 0.4;
    } else {
      ctx.fillStyle = COLOR.pendiente;
    }

    ctx.fillRect(x, yBarra, anchoPedazo - 2, altoBarra);

    ctx.globalAlpha = 1;
    x += anchoPedazo;
  });

  ctx.fillStyle = COLOR.lapizSuave;
  ctx.font = '12px ' + LETRA_TEXTO;

  const textoHoras =
    total > 0
      ? `${hechas} de ${total} horas completadas`
      : 'Agrega módulos a tu ruta para ver tu avance';

  ctx.fillText(textoHoras, xBarra, yBarra + altoBarra + 18);

  // Dibuja la leyenda
  const leyenda = [
    { color: COLOR.tinta, alfa: 1, texto: 'Completado' },
    { color: COLOR.tinta, alfa: 0.4, texto: 'En curso' },
    { color: COLOR.pendiente, alfa: 1, texto: 'Pendiente' },
  ];

  let xLeyenda = xBarra;
  const yLeyenda = yBarra + altoBarra + 42;

  leyenda.forEach((elemento) => {
    ctx.globalAlpha = elemento.alfa;
    ctx.fillStyle = elemento.color;
    ctx.fillRect(xLeyenda, yLeyenda - 10, 12, 12);

    ctx.globalAlpha = 1;
    ctx.fillStyle = COLOR.lapizSuave;
    ctx.fillText(elemento.texto, xLeyenda + 17, yLeyenda);

    xLeyenda += ctx.measureText(elemento.texto).width + 32;
  });

  // Dibuja las insignias
  const yInsignias = 272;
  const ganadas = insigniasGanadas();

  ctx.fillStyle = COLOR.tinta;
  ctx.font = 'bold 16px ' + LETRA_MANO;
  ctx.fillText(
    `Insignias (${ganadas.length} de ${INSIGNIAS.length})`,
    xBarra,
    yInsignias
  );

  const espacio = anchoBarra / INSIGNIAS.length;

  INSIGNIAS.forEach((insignia, i) => {
    const gano = ganadas.includes(insignia);
    const cx = xBarra + espacio * i + espacio / 2;
    const cy = yInsignias + 30;

    ctx.fillStyle = gano ? COLOR.dorado : COLOR.hoja;

    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = gano ? '#ffffff' : COLOR.pendiente;
    ctx.font = 'bold 16px ' + LETRA_TEXTO;
    ctx.fillText('★', cx, cy + 1);

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = gano ? COLOR.lapiz : COLOR.lapizSuave;
    ctx.font = (gano ? 'bold ' : '') + '14px ' + LETRA_MANO;
    ctx.fillText(insignia.corto, cx, cy + 36);
  });

  // Agrega una descripcion para lectores de pantalla
  const nombresGanadas = ganadas
    .map((insignia) => insignia.nombre)
    .join(', ');

  lienzo.setAttribute(
    'aria-label',
    `Progreso: ${porcentaje}% completado, ${hechas} de ${total} horas. Insignias ganadas: ${nombresGanadas || 'ninguna'}.`
  );
}

// Redibuja el canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', dibujarProgreso);


// Marca o quita el error de un campo
function marcarCampo(campo, error) {
  campo.setAttribute('aria-invalid', error ? 'true' : 'false');

  document.getElementById(campo.id + '-error').textContent =
    error || '';
}

// Guarda los datos del perfil
formPerfil.addEventListener('submit', (e) => {
  e.preventDefault();

  const errorNombre = validarNombre(inputNombre.value);
  const errorMeta = validarMeta(inputMeta.value);

  marcarCampo(inputNombre, errorNombre);
  marcarCampo(inputMeta, errorMeta);

  if (errorNombre) return inputNombre.focus();
  if (errorMeta) return inputMeta.focus();

  perfil.nombre = inputNombre.value.trim();
  perfil.meta = Number(inputMeta.value);

  actualizarTodo();
  pintarPerfil();
  mostrarAviso('Perfil guardado.', 'ok');
});

// Valida los campos al salir de ellos
inputNombre.addEventListener('blur', () =>
  marcarCampo(inputNombre, validarNombre(inputNombre.value))
);

inputMeta.addEventListener('blur', () =>
  marcarCampo(inputMeta, validarMeta(inputMeta.value))
);

// Muestra los datos guardados en el perfil
function pintarPerfil() {
  inputNombre.value = perfil.nombre;
  inputMeta.value = perfil.meta || '';
  selectTipo.value = perfil.tipoBiblioteca;

  saludo.textContent = perfil.nombre
    ? 'Hola, ' + perfil.nombre
    : 'Hola, estudiante';
}


// Opciones para obtener la ubicacion
const OPCIONES_GPS = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 60000,
};

// Mensajes para los errores de ubicacion
const MENSAJES_ERROR = {
  1: 'Permiso denegado. Haz clic en el ícono que está a la izquierda de la barra de direcciones y permite la ubicación.',
  2: 'No se pudo determinar tu ubicación. Revisa que la ubicación de Windows esté activada.',
  3: 'Se agotó el tiempo de espera. Inténtalo de nuevo.',
};

// Calcula la distancia entre dos puntos
function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// Da formato a la distancia
function formatoDistancia(km) {
  return km < 1
    ? Math.round(km * 1000) + ' m'
    : km.toFixed(1) + ' km';
}

// Calcula los minutos caminando
function minutosCaminando(km) {
  return Math.max(
    1,
    Math.ceil((km / VELOCIDAD_CAMINANDO_KMH) * 60)
  );
}

// Busca las bibliotecas mas cercanas
function bibliotecasCercanas() {
  const delTipo = LUGARES.filter(
    (lugar) =>
      perfil.tipoBiblioteca === 'todas' ||
      lugar.tipo === perfil.tipoBiblioteca
  );

  const conDistancia = delTipo.map((lugar) => ({
    nombre: lugar.nombre,
    lat: lugar.lat,
    lon: lugar.lon,
    km: distanciaKm(
      ubicacion.lat,
      ubicacion.lon,
      lugar.lat,
      lugar.lon
    ),
  }));

  conDistancia.sort((a, b) => a.km - b.km);

  return conDistancia;
}

// Muestra un mensaje sobre la ubicacion
function mostrarEstadoUbicacion(texto, esError = false) {
  estadoUbicacion.textContent = texto;
  estadoUbicacion.classList.toggle(
    'error-ubicacion',
    esError
  );
}

// Solicita la ubicacion del usuario
function ubicarUsuario() {
  if (!('geolocation' in navigator)) {
    mostrarEstadoUbicacion(
      'Tu navegador no soporta geolocalización.',
      true
    );
    return;
  }

  mostrarEstadoUbicacion(
    'Buscando tu ubicación… Si el navegador te pregunta, dale «Permitir».'
  );

  navigator.geolocation.getCurrentPosition(
    alEncontrarUbicacion,
    alFallarUbicacion,
    OPCIONES_GPS
  );
}

// Guarda la ubicacion encontrada
function alEncontrarUbicacion(pos) {
  const { latitude, longitude, accuracy } = pos.coords;

  ubicacion = {
    lat: latitude,
    lon: longitude,
    precision: Math.round(accuracy),
    fecha: pos.timestamp,
  };

  guardarLocal();
  pintarUbicacion();
}

// Muestra el error al obtener la ubicacion
function alFallarUbicacion(err) {
  mostrarEstadoUbicacion(
    MENSAJES_ERROR[err.code] || 'Error desconocido.',
    true
  );
}

btnUbicacion.addEventListener('click', ubicarUsuario);

// Actualiza las bibliotecas al cambiar el tipo
selectTipo.addEventListener('change', () => {
  perfil.tipoBiblioteca = selectTipo.value;

  guardarLocal();
  pintarUbicacion();
});

// Muestra la ubicacion y la biblioteca mas cercana
function pintarUbicacion() {
  document.body.classList.remove('modo-estudio');

  if (!ubicacion) {
    datosUbicacion.hidden = true;
    return;
  }

  datosUbicacion.hidden = false;
  btnUbicacion.textContent = 'Actualizar ubicación';

  mostrarEstadoUbicacion(
    'Actualizada: ' +
      new Date(ubicacion.fecha).toLocaleString('es-CO')
  );

  textoCoordenadas.textContent =
    `Latitud ${ubicacion.lat.toFixed(5)}, longitud ${ubicacion.lon.toFixed(5)} ` +
    `(precisión: ${ubicacion.precision} m)`;

  enlaceMapa.href =
    `https://www.openstreetmap.org/?mlat=${ubicacion.lat}` +
    `&mlon=${ubicacion.lon}#map=17/${ubicacion.lat}/${ubicacion.lon}`;

  const lista = bibliotecasCercanas();
  const cercana = lista[0];

  // Activa el modo estudio cerca de una biblioteca
  const enBiblioteca =
    cercana.km <= RADIO_BIBLIOTECA_KM;

  document.body.classList.toggle(
    'modo-estudio',
    enBiblioteca
  );

  if (enBiblioteca) {
    tituloBiblioteca.textContent = 'Modo estudio';

    const enCurso = ruta.find(
      (item) => item.estado === 'curso'
    );

    const recomendado = siguienteRecomendado();

    if (enCurso) {
      textoBiblioteca.textContent =
        `Estás en ${cercana.nombre}: aprovecha para avanzar en ${nombreDe(enCurso.id)}.`;
    } else if (recomendado) {
      textoBiblioteca.textContent =
        `Estás en ${cercana.nombre}: buen momento para empezar ${nombreDe(recomendado)}.`;
    } else {
      textoBiblioteca.textContent =
        `Estás en ${cercana.nombre}: buen momento para avanzar en tu ruta.`;
    }

    enlaceComoLlegar.hidden = true;
  } else {
    tituloBiblioteca.textContent =
      'Biblioteca más cercana';

    textoBiblioteca.textContent =
      `${cercana.nombre}, a ${formatoDistancia(cercana.km)} ` +
      `(unos ${minutosCaminando(cercana.km)} min caminando).`;

    enlaceComoLlegar.hidden = false;

    enlaceComoLlegar.href =
      `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=` +
      `${ubicacion.lat}%2C${ubicacion.lon}%3B${cercana.lat}%2C${cercana.lon}`;
  }

  // Muestra otras bibliotecas cercanas
  listaOtras.innerHTML = '';

  lista.slice(1, 3).forEach((lugar) => {
    const li = document.createElement('li');

    li.textContent =
      `${lugar.nombre}: ${formatoDistancia(lugar.km)}`;

    listaOtras.appendChild(li);
  });
}


// Reinicia la ruta y el progreso
function reiniciarRuta() {
  if (ruta.length === 0) {
    return mostrarAviso(
      'Tu ruta ya está vacía.',
      'error'
    );
  }

  if (!confirm('¿Seguro que quieres borrar toda tu ruta y tu progreso?')) {
    return;
  }

  ruta = [];
  actualizarTodo();

  mostrarAviso(
    'Tu ruta quedó vacía. ¡Empieza de nuevo!',
    'ok'
  );
}

btnReiniciar.addEventListener('click', reiniciarRuta);

// Carga los datos y muestra la pagina
cargarLocal();
pintarPerfil();
pintarTodo();

// Espera a que las fuentes esten listas para redibujar el canvas
if (document.fonts) {
  document.fonts.ready.then(dibujarProgreso);
}
