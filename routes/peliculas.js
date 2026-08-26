const express = require('express');

const router = express.Router();

let peliculas = [];
let siguienteId = 1;

const camposObligatorios = ['titulo', 'genero', 'horario', 'sala'];

function validarPelicula(datos) {
  const errores = [];

  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['El cuerpo de la solicitud debe ser un objeto JSON válido.'];
  }

  camposObligatorios.forEach((campo) => {
    if (typeof datos[campo] !== 'string' || datos[campo].trim() === '') {
      errores.push(`El campo ${campo} es obligatorio.`);
    }
  });

  if (
    datos.duracionMinutos === undefined ||
    datos.duracionMinutos === null ||
    datos.duracionMinutos === '' ||
    !Number.isFinite(Number(datos.duracionMinutos)) ||
    Number(datos.duracionMinutos) <= 0
  ) {
    errores.push('duracionMinutos debe ser un número positivo.');
  }

  if (
    datos.precioEntrada === undefined ||
    datos.precioEntrada === null ||
    datos.precioEntrada === '' ||
    !Number.isFinite(Number(datos.precioEntrada)) ||
    Number(datos.precioEntrada) <= 0
  ) {
    errores.push('precioEntrada debe ser un número positivo.');
  }

  if (Object.prototype.hasOwnProperty.call(datos, 'cartelera') && typeof datos.cartelera !== 'boolean') {
    errores.push('cartelera debe ser un valor booleano (true o false).');
  }

  return errores;
}

function normalizarPelicula(datos, id, cartelera = true) {
  return {
    id,
    titulo: datos.titulo.trim(),
    genero: datos.genero.trim(),
    duracionMinutos: Number(datos.duracionMinutos),
    horario: datos.horario.trim(),
    sala: datos.sala.trim(),
    precioEntrada: Number(datos.precioEntrada),
    cartelera: datos.cartelera === undefined ? cartelera : datos.cartelera,
  };
}

router.get('/', (req, res) => {
  res.json(peliculas);
});

router.get('/:id', (req, res) => {
  const pelicula = peliculas.find((item) => item.id === Number(req.params.id));

  if (!pelicula) {
    return res.status(404).json({ mensaje: 'Película no encontrada.' });
  }

  res.json(pelicula);
});

router.post('/', (req, res) => {
  if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud debe ser un objeto JSON válido.' });
  }

  const errores = validarPelicula(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Los datos de la película no son válidos.', errores });
  }

  const pelicula = normalizarPelicula(req.body, siguienteId);
  siguienteId += 1;
  peliculas.push(pelicula);

  res.status(201).json(pelicula);
});

router.put('/:id', (req, res) => {
  const indice = peliculas.findIndex((item) => item.id === Number(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Película no encontrada.' });
  }

  if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud debe ser un objeto JSON válido.' });
  }

  const errores = validarPelicula(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Los datos de la película no son válidos.', errores });
  }

  const peliculaActualizada = normalizarPelicula(
    req.body,
    peliculas[indice].id,
    peliculas[indice].cartelera
  );
  peliculas[indice] = peliculaActualizada;

  res.json(peliculaActualizada);
});

router.delete('/:id', (req, res) => {
  const indice = peliculas.findIndex((item) => item.id === Number(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Película no encontrada.' });
  }

  const peliculaEliminada = peliculas.splice(indice, 1)[0];
  res.json({ mensaje: 'Película eliminada correctamente.', pelicula: peliculaEliminada });
});

router.obtenerPeliculas = () => peliculas;

module.exports = router;
