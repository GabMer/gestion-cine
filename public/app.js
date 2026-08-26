const form = document.querySelector('#pelicula-form');
const peliculasBody = document.querySelector('#peliculas-body');
const emptyState = document.querySelector('#empty-state');
const formMessage = document.querySelector('#form-message');
const movieCount = document.querySelector('#movie-count');
const formTitle = document.querySelector('#form-title');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-button');
const entradaForm = document.querySelector('#entrada-form');
const entradaPelicula = document.querySelector('#entrada-pelicula');
const cantidadEntrada = document.querySelector('#cantidad');
const entradaTotal = document.querySelector('#entrada-total');
const entradaMessage = document.querySelector('#entrada-message');
const entradasBody = document.querySelector('#entradas-body');
const entradasEmptyState = document.querySelector('#entradas-empty-state');
const ticketCount = document.querySelector('#ticket-count');

let peliculasDisponibles = [];

const fields = ['titulo', 'genero', 'duracionMinutos', 'horario', 'sala', 'precioEntrada', 'cartelera'];

async function obtenerPeliculas() {
  const response = await fetch('/api/peliculas');
  if (!response.ok) throw new Error('No se pudieron cargar las películas.');
  return response.json();
}

async function obtenerEntradas() {
  const response = await fetch('/api/entradas');
  if (!response.ok) throw new Error('No se pudieron cargar las entradas.');
  return response.json();
}

function mostrarMensajeEntrada(mensaje = '', esError = true) {
  entradaMessage.textContent = mensaje;
  entradaMessage.className = `form-message${esError ? ' form-message-error' : ' form-message-success'}`;
}

function actualizarTotalEntrada() {
  const pelicula = peliculasDisponibles.find((item) => item.id === Number(entradaPelicula.value));
  const cantidad = Number(cantidadEntrada.value) || 0;
  entradaTotal.textContent = `$${(pelicula ? pelicula.precioEntrada * cantidad : 0).toFixed(2)}`;
}

function actualizarSelectorPeliculas(peliculas) {
  peliculasDisponibles = peliculas.filter((pelicula) => pelicula.cartelera === true);
  entradaPelicula.replaceChildren(new Option('Seleccioná una película', ''));

  peliculasDisponibles.forEach((pelicula) => {
    const opcion = new Option(`${pelicula.titulo} - ${pelicula.horario} (Sala ${pelicula.sala})`, pelicula.id);
    entradaPelicula.append(opcion);
  });

  actualizarTotalEntrada();
}

function mostrarEntradas(entradas) {
  entradasBody.replaceChildren();

  entradas.forEach((entrada) => {
    const pelicula = peliculasDisponibles.find((item) => item.id === entrada.peliculaId);
    const fila = document.createElement('tr');
    const valores = [
      entrada.cliente,
      pelicula ? pelicula.titulo : `Película #${entrada.peliculaId}`,
      entrada.cantidad,
      `$${entrada.precioUnitario.toFixed(2)}`,
      `$${entrada.total.toFixed(2)}`,
      new Date(entrada.fecha).toLocaleString('es-AR'),
    ];

    valores.forEach((valor) => {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.append(celda);
    });

    const acciones = document.createElement('td');
    const eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.className = 'button-small delete-button';
    eliminar.dataset.id = entrada.id;
    eliminar.textContent = 'Eliminar';
    acciones.append(eliminar);
    fila.append(acciones);
    entradasBody.append(fila);
  });

  entradasEmptyState.hidden = entradas.length > 0;
  ticketCount.textContent = `${entradas.length} ${entradas.length === 1 ? 'entrada' : 'entradas'}`;
}

async function listarEntradas() {
  try {
    mostrarEntradas(await obtenerEntradas());
  } catch (error) {
    mostrarMensajeEntrada(error.message);
  }
}

async function cargarDatosIniciales() {
  try {
    await listarPeliculas();
    await listarEntradas();
  } catch (error) {
    mostrarMensajeEntrada(error.message);
  }
}

function mostrarPeliculas(peliculas) {
  peliculasBody.replaceChildren();

  peliculas.forEach((pelicula) => {
    const fila = document.createElement('tr');
    const valores = [
      pelicula.titulo,
      pelicula.genero,
      `${pelicula.duracionMinutos} min`,
      pelicula.horario,
      pelicula.sala,
      `$${pelicula.precioEntrada.toFixed(2)}`,
    ];

    valores.forEach((valor) => {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.append(celda);
    });

    const estadoCelda = document.createElement('td');
    const estado = document.createElement('span');
    estado.className = `badge ${pelicula.cartelera ? 'badge-active' : 'badge-inactive'}`;
    estado.textContent = pelicula.cartelera ? 'En cartelera' : 'Fuera';
    estadoCelda.append(estado);
    fila.append(estadoCelda);

    const acciones = document.createElement('td');
    acciones.className = 'actions';
    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'button-small edit-button';
    editar.dataset.id = pelicula.id;
    editar.textContent = 'Editar';
    const eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.className = 'button-small delete-button';
    eliminar.dataset.id = pelicula.id;
    eliminar.textContent = 'Eliminar';
    acciones.append(editar, eliminar);
    fila.append(acciones);
    peliculasBody.append(fila);
  });

  emptyState.hidden = peliculas.length > 0;
  movieCount.textContent = `${peliculas.length} ${peliculas.length === 1 ? 'película' : 'películas'}`;
}

async function listarPeliculas() {
  try {
    const peliculas = await obtenerPeliculas();
    mostrarPeliculas(peliculas);
    actualizarSelectorPeliculas(peliculas);
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

function datosDelFormulario() {
  const datos = Object.fromEntries(new FormData(form).entries());
  datos.duracionMinutos = Number(datos.duracionMinutos);
  datos.precioEntrada = Number(datos.precioEntrada);
  datos.cartelera = document.querySelector('#cartelera').checked;
  return datos;
}

function mostrarMensaje(mensaje = '', esError = true) {
  formMessage.textContent = mensaje;
  formMessage.className = `form-message${esError ? ' form-message-error' : ' form-message-success'}`;
}

function limpiarFormulario() {
  form.reset();
  document.querySelector('#pelicula-id').value = '';
  document.querySelector('#cartelera').checked = true;
  formTitle.textContent = 'Nueva película';
  submitButton.textContent = 'Agregar película';
  cancelButton.hidden = true;
}

async function guardarPelicula(event) {
  event.preventDefault();
  const id = document.querySelector('#pelicula-id').value;
  const response = await fetch(id ? `/api/peliculas/${id}` : '/api/peliculas', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosDelFormulario()),
  });
  const resultado = await response.json();
  if (!response.ok) throw new Error(resultado.errores?.join(' ') || resultado.mensaje);
  limpiarFormulario();
  mostrarMensaje(id ? 'Película actualizada correctamente.' : 'Película agregada correctamente.', false);
  await listarPeliculas();
}

async function editarPelicula(id) {
  const response = await fetch(`/api/peliculas/${id}`);
  if (!response.ok) throw new Error('No se pudo cargar la película.');
  const pelicula = await response.json();
  fields.forEach((field) => { document.querySelector(`#${field}`).value = pelicula[field]; });
  document.querySelector('#cartelera').checked = pelicula.cartelera;
  document.querySelector('#pelicula-id').value = pelicula.id;
  formTitle.textContent = 'Editar película';
  submitButton.textContent = 'Guardar cambios';
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function eliminarPelicula(id) {
  if (!window.confirm('¿Eliminar esta película?')) return;
  const response = await fetch(`/api/peliculas/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('No se pudo eliminar la película.');
  await listarPeliculas();
}

async function guardarEntrada(event) {
  event.preventDefault();
  const datos = Object.fromEntries(new FormData(entradaForm).entries());
  datos.cantidad = Number(datos.cantidad);
  datos.peliculaId = Number(datos.peliculaId);

  const response = await fetch('/api/entradas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(resultado.errores?.join(' ') || resultado.mensaje);
  }

  entradaForm.reset();
  cantidadEntrada.value = 1;
  actualizarTotalEntrada();
  mostrarMensajeEntrada('Venta registrada correctamente.', false);
  await listarEntradas();
}

async function eliminarEntrada(id) {
  if (!window.confirm('¿Anular esta entrada?')) return;
  const response = await fetch(`/api/entradas/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    const resultado = await response.json();
    throw new Error(resultado.mensaje || 'No se pudo eliminar la entrada.');
  }

  await listarEntradas();
}

form.addEventListener('submit', (event) => guardarPelicula(event).catch((error) => mostrarMensaje(error.message)));
cancelButton.addEventListener('click', limpiarFormulario);
peliculasBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.classList.contains('edit-button') ? editarPelicula : eliminarPelicula;
  action(button.dataset.id).catch((error) => mostrarMensaje(error.message));
});

entradaPelicula.addEventListener('change', actualizarTotalEntrada);
cantidadEntrada.addEventListener('input', actualizarTotalEntrada);
entradaForm.addEventListener('submit', (event) => guardarEntrada(event).catch((error) => mostrarMensajeEntrada(error.message)));
entradasBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) eliminarEntrada(button.dataset.id).catch((error) => mostrarMensajeEntrada(error.message));
});

cargarDatosIniciales();
