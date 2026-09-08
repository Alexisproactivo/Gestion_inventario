require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. Importar las rutas
const productoRoutes = require('./src/routes/productoRoutes');
const authRoutes = require('./src/routes/authRoutes'); // <-- ESTA LÍNEA FALTABA

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 3. Montar las Rutas
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);

// 4. Iniciar Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});