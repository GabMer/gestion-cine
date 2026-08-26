const express = require('express');
const peliculasRouter = require('./peliculas');
const entradasRouter = require('./entradas');

const router = express.Router();

router.get('/', (req, res) => {
  const peliculas = peliculasRouter.obtenerPeliculas();
  const entradas = entradasRouter.obtenerEntradas();
  const peliculasPorId = new Map(peliculas.map((pelicula) => [pelicula.id, pelicula]));

  const recaudacionTotal = Number(
    entradas.reduce((total, entrada) => total + entrada.total, 0).toFixed(2)
  );
  const cantidadTotalEntradas = entradas.reduce(
    (total, entrada) => total + entrada.cantidad,
    0
  );
  const recaudacionPorPelicula = new Map();

  entradas.forEach((entrada) => {
    const pelicula = peliculasPorId.get(entrada.peliculaId);
    const actual = recaudacionPorPelicula.get(entrada.peliculaId) || {
      peliculaId: entrada.peliculaId,
      titulo: pelicula ? pelicula.titulo : `Película #${entrada.peliculaId}`,
      monto: 0,
      cantidadEntradas: 0,
    };

    actual.monto = Number((actual.monto + entrada.total).toFixed(2));
    actual.cantidadEntradas += entrada.cantidad;
    recaudacionPorPelicula.set(entrada.peliculaId, actual);
  });

  const recaudacion = Array.from(recaudacionPorPelicula.values());
  const peliculaConMasEntradas = recaudacion.reduce(
    (mayor, pelicula) =>
      !mayor || pelicula.cantidadEntradas > mayor.cantidadEntradas ? pelicula : mayor,
    null
  );

  res.json({
    recaudacionTotal,
    cantidadTotalEntradas,
    recaudacionPorPelicula: recaudacion,
    peliculaConMasEntradas,
  });
});

module.exports = router;