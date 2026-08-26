const form = document.querySelector('#pelicula-form');
const peliculasBody = document.querySelector('#peliculas-body');
const emptyState = document.querySelector('#empty-state');
const formMessage = document.querySelector('#form-message');
const movieCount = document.querySelector('#movie-count');
const formTitle = document.querySelector('#form-title');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-button');

const fields = ['titulo', 'genero', 'duracionMinutos', 'horario', 'sala', 'precioEntrada', 'cartelera'];

async function obtenerPeliculas() {
  const response = await fetch('/api/peliculas');
  if (!response.ok) throw new Error('No se pudieron cargar las películas.');
  return response.json();
}

function mostrarPeliculas(peliculas) {
  peliculasBody.innerHTML = peliculas.map((pelicula) => `
    <tr>
      <td>${pelicula.titulo}</td><td>${pelicula.genero}</td><td>${pelicula.duracionMinutos} min</td>
      <td>${pelicula.horario}</td><td>${pelicula.sala}</td><td>$${pelicula.precioEntrada.toFixed(2)}</td>
      <td><span class="badge ${pelicula.cartelera ? 'badge-active' : 'badge-inactive'}">${pelicula.cartelera ? 'En cartelera' : 'Fuera'}</span></td>
      <td class="actions"><button type="button" class="button-small edit-button" data-id="${pelicula.id}">Editar</button><button type="button" class="button-small delete-button" data-id="${pelicula.id}">Eliminar</button></td>
    </tr>
  `).join('');
  emptyState.hidden = peliculas.length > 0;
  movieCount.textContent = `${peliculas.length} ${peliculas.length === 1 ? 'película' : 'películas'}`;
}

async function listarPeliculas() {
  try {
    mostrarPeliculas(await obtenerPeliculas());
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

form.addEventListener('submit', (event) => guardarPelicula(event).catch((error) => mostrarMensaje(error.message)));
cancelButton.addEventListener('click', limpiarFormulario);
peliculasBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.classList.contains('edit-button') ? editarPelicula : eliminarPelicula;
  action(button.dataset.id).catch((error) => mostrarMensaje(error.message));
});

listarPeliculas();
