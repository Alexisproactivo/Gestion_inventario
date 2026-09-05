require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productoRoutes = require('./src/routes/productoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use('/api/productos', productoRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor modular corriendo en http://localhost:${PORT}`);
});