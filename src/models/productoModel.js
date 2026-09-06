const pool = require('../config/db');

const Producto = {
// Obtener productos paginados y el conteo total
  obtenerPaginados: async (limite = 5, offset = 0) => {
    // 1. Traer la porción de datos
    const dataQuery = `
      SELECT * FROM productos 
      ORDER BY id ASC 
      LIMIT $1 OFFSET $2;
    `;
    const { rows: productos } = await pool.query(dataQuery, [limite, offset]);

    // 2. Traer el total absoluto de filas en la tabla
    const countQuery = 'SELECT COUNT(*) FROM productos;';
    const { rows: countRows } = await pool.query(countQuery);
    const total = parseInt(countRows[0].count, 10);

    return {
      productos,
      total,
      totalPaginas: Math.ceil(total / limite)
    };
  },

  crear: async (datos) => {
    const { nombre, categoria, precio, stock, estado } = datos;
    const query = `
      INSERT INTO productos (nombre, categoria, precio, stock, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [nombre, categoria, precio, stock, estado || 'disponible'];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

actualizar: async (id, datos) => {
    const { nombre, categoria, precio, stock, estado } = datos;
    const query = `
      UPDATE productos
      SET nombre = $1, categoria = $2, precio = $3, stock = $4, estado = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [nombre, categoria, precio, stock, estado, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  eliminar: async (id) => {
    const query = 'DELETE FROM productos WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};

  

module.exports = Producto;