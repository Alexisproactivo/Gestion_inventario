const pool = require('../config/db');

const Usuario = {
  // Busca un usuario por su google_id o lo crea si no existe (patrón UPSERT)
  buscarOCrearPorGoogle: async ({ googleId, nombre, email, avatarUrl }) => {
    // 1. Buscar si ya existe
    const buscarQuery = 'SELECT * FROM usuarios WHERE google_id = $1;';
    const { rows: existentes } = await pool.query(buscarQuery, [googleId]);

    if (existentes.length > 0) {
      return existentes[0];
    }

    // 2. Si no existe, registrar nuevo usuario
    const insertarQuery = `
      INSERT INTO usuarios (google_id, nombre, email, avatar_url, rol)
      VALUES ($1, $2, $3, $4, 'operador')
      RETURNING *;
    `;
    const valores = [googleId, nombre, email, avatarUrl];
    const { rows: nuevos } = await pool.query(insertarQuery, valores);

    return nuevos[0];
  }
};

module.exports = Usuario;