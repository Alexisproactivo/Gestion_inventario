const pool = require('../config/db');

const Auditoria = {
  // Registrar un nuevo movimiento
  registrar: async ({ usuarioId, accion, productoId, detalles }) => {
    const query = `
      INSERT INTO auditoria (usuario_id, accion, producto_id, detalles)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [usuarioId || null, accion, productoId || null, detalles]);
    return rows[0];
  },

  // Obtener los últimos movimientos con el nombre y avatar del usuario
  listarRecientes: async (limite = 20) => {
    const query = `
      SELECT 
        a.id,
        a.accion,
        a.producto_id,
        a.detalles,
        a.creado_en,
        u.nombre AS usuario_nombre,
        u.email AS usuario_email,
        u.avatar_url AS usuario_avatar
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.creado_en DESC
      LIMIT $1;
    `;
    const { rows } = await pool.query(query, [limite]);
    return rows;
  }
};

module.exports = Auditoria;