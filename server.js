const express = require('express');
const path = require('path');
const peliculasRouter = require('./routes/peliculas');
const entradasRouter = require('./routes/entradas');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/peliculas', peliculasRouter);
app.use('/api/entradas', entradasRouter);
app.use('/api/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
