require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. Importar las rutas modulares
const productoRoutes = require('./src/routes/productoRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middlewares base
app.use(cors());
app.use(express.json());

// 3. Redirigir la raíz directamente al login ANTES de servir los archivos estáticos
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// 4. Servir la carpeta pública
app.use(express.static('public'));

// 5. Montar las rutas de la API
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);

// 6. Iniciar Servidor (siempre al final de todo)
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});