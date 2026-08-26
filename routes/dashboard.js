const express = require('express');
const peliculasRouter = require('./peliculas');
const entradasRouter = require('./entradas');

const router = express.Router();

router.get('/', (req, res) => {
  const peliculas = peliculasRouter.obtenerPeliculas();
  const entradas = entradasRouter.obtenerEntradas();
  const peliculasPorId = new Map(
    peliculas.map((pelicula) => [pelicula.id, pelicula])
  );

  const recaudacionTotal = Number(
    entradas.reduce((total, entrada) => total + entrada.total, 0).toFixed(2)
  );

  if (!Number.isFinite(recaudacionTotal)) {
    return res.status(500).json({
      mensaje: 'No se pudo calcular la recaudación total: el monto no es finito.',
    });
  }

  const cantidadTotalEntradas = entradas.reduce(
    (total, entrada) => total + entrada.cantidad,
    0
  );
  const recaudacionPorPelicula = new Map();

  for (const entrada of entradas) {
    const pelicula = peliculasPorId.get(entrada.peliculaId);
    const actual = recaudacionPorPelicula.get(entrada.peliculaId) || {
      peliculaId: entrada.peliculaId,
      titulo: pelicula
        ? pelicula.titulo
        : entrada.tituloPelicula || `Película #${entrada.peliculaId}`,
      monto: 0,
      cantidadEntradas: 0,
    };

    actual.monto = Number((actual.monto + entrada.total).toFixed(2));

    if (!Number.isFinite(actual.monto)) {
      return res.status(500).json({
        mensaje: 'No se pudo calcular la recaudación por película: el monto no es finito.',
      });
    }

    actual.cantidadEntradas += entrada.cantidad;
    recaudacionPorPelicula.set(entrada.peliculaId, actual);
  }

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