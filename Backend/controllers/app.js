const express = require('express');
const path = require('path');
const db = require('./models');
const sequelize = db.sequelize;
const authRoutes = require('./routes/authRoutes');
const denunciaRoutes = require('./routes/denunciaRoutes');

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../../')));

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
  })
  .catch(err => {
    console.error('No se pudo conectar o sincronizar la base de datos:', err);
  });

app.use('/api/auth', authRoutes);
app.use('/api/denuncias', denunciaRoutes);

// Ruta principal que sirve el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
