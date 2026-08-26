const express = require('express');
const peliculasRouter = require('./peliculas');

const router = express.Router();

let entradas = [];
let siguienteId = 1;
const CANTIDAD_MAXIMA = 50;

function validarEntrada(datos) {
  const errores = [];

  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['El cuerpo de la solicitud debe ser un objeto JSON válido.'];
  }

  if (typeof datos.cliente !== 'string' || datos.cliente.trim() === '') {
    errores.push('El campo cliente es obligatorio.');
  }

  if (
    datos.peliculaId === undefined ||
    datos.peliculaId === null ||
    datos.peliculaId === '' ||
    !Number.isInteger(Number(datos.peliculaId)) ||
    Number(datos.peliculaId) <= 0
  ) {
    errores.push('peliculaId debe ser un número entero positivo.');
  }

  if (
    datos.cantidad === undefined ||
    datos.cantidad === null ||
    datos.cantidad === '' ||
    !Number.isInteger(Number(datos.cantidad)) ||
    Number(datos.cantidad) <= 0 ||
    Number(datos.cantidad) > CANTIDAD_MAXIMA
  ) {
    errores.push(`cantidad debe ser un número entero positivo entre 1 y ${CANTIDAD_MAXIMA}.`);
  }

  return errores;
}

router.get('/', (req, res) => {
  res.json(entradas);
});

router.post('/', (req, res) => {
  const errores = validarEntrada(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Los datos de la entrada no son válidos.', errores });
  }

  const pelicula = peliculasRouter.obtenerPeliculas().find(
    (item) => item.id === Number(req.body.peliculaId)
  );

  if (!pelicula) {
    return res.status(404).json({ mensaje: 'La película indicada no existe.' });
  }

  if (pelicula.cartelera !== true) {
    return res.status(400).json({ mensaje: 'La película no está disponible en cartelera.' });
  }

  const cantidad = Number(req.body.cantidad);
  const total = Number((cantidad * pelicula.precioEntrada).toFixed(2));

  if (!Number.isFinite(total)) {
    return res.status(400).json({ mensaje: 'El total de la entrada no es un monto válido.' });
  }

  const entrada = {
    id: siguienteId,
    cliente: req.body.cliente.trim(),
    peliculaId: pelicula.id,
    tituloPelicula: pelicula.titulo,
    cantidad,
    precioUnitario: pelicula.precioEntrada,
    total,
    fecha: new Date().toISOString(),
  };

  siguienteId += 1;
  entradas.push(entrada);

  res.status(201).json(entrada);
});

router.delete('/:id', (req, res) => {
  const indice = entradas.findIndex((item) => item.id === Number(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Entrada no encontrada.' });
  }

  const entradaEliminada = entradas.splice(indice, 1)[0];
  res.json({ mensaje: 'Entrada eliminada correctamente.', entrada: entradaEliminada });
});

router.obtenerEntradas = () => entradas;

module.exports = router;
