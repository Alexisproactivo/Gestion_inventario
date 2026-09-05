const pool = require('../config/db');

const Producto = {
  obtenerTodos: async () => {
    const query = 'SELECT * FROM productos ORDER BY id ASC';
    const { rows } = await pool.query(query);
    return rows;
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