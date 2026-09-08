const pool = require('../config/db');

const Producto = {
  obtenerPaginados: async ({ limite = 5, offset = 0, busqueda = '', categoria = 'todas' }) => {
    const condiciones = [];
    const valores = [];

    // Filtro dinámico por nombre o categoría
    if (busqueda.trim() !== '') {
      valores.push(`%${busqueda.trim()}%`);
      condiciones.push(`nombre ILIKE $${valores.length}`);
    }

    if (categoria !== 'todas' && categoria.trim() !== '') {
      valores.push(categoria.trim());
      condiciones.push(`categoria = $${valores.length}`);
    }

    const whereSQL = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    // 1. Traer los productos filtrados y paginados
    const dataQuery = `
      SELECT * FROM productos 
      ${whereSQL}
      ORDER BY id ASC 
      LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
    `;
    const { rows: productos } = await pool.query(dataQuery, [...valores, limite, offset]);

    // 2. Conteo de filas que coinciden con el filtro (para calcular totalPaginas)
    const countFiltroQuery = `SELECT COUNT(*) FROM productos ${whereSQL};`;
    const { rows: countFiltroRows } = await pool.query(countFiltroQuery, valores);
    const totalFiltrados = parseInt(countFiltroRows[0].count, 10);

    // 3. Métricas GLOBALES reales de toda la base de datos (independiente de la página)
    const statsQuery = `
      SELECT 
        COUNT(*) AS total_items,
        COALESCE(SUM(stock), 0) AS stock_total,
        COALESCE(SUM(precio * stock), 0) AS valor_total
      FROM productos;
    `;
    const { rows: statsRows } = await pool.query(statsQuery);

    // 4. Lista de todas las categorías existentes para el select
    const catQuery = `SELECT DISTINCT categoria FROM productos ORDER BY categoria ASC;`;
    const { rows: catRows } = await pool.query(catQuery);

    return {
      productos,
      total: totalFiltrados,
      totalPaginas: Math.ceil(totalFiltrados / limite) || 1,
      stats: {
        total: parseInt(statsRows[0].total_items, 10),
        stock: parseInt(statsRows[0].stock_total, 10),
        valor: parseFloat(statsRows[0].valor_total)
      },
      categorias: catRows.map(c => c.categoria)
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