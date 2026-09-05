const Producto = require('../models/productoModel');

const productoController = {
  listar: async (req, res) => {
    try {
      const productos = await Producto.obtenerTodos();
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al listar productos:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al consultar productos' });
    }
  },

  crear: async (req, res) => {
    try {
      const { nombre, categoria, precio, stock } = req.body;

      if (!nombre || !categoria || precio === undefined || stock === undefined) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
      }

      if (precio < 0 || stock < 0) {
        return res.status(400).json({ mensaje: 'Precio y stock deben ser números positivos' });
      }

      const nuevoProducto = await Producto.crear(req.body);
      res.status(201).json({ mensaje: 'Producto creado con éxito', producto: nuevoProducto });
    } catch (error) {
      console.error('Error al registrar producto:', error);
      res.status(500).json({ mensaje: 'Error al registrar el producto' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, categoria, precio, stock } = req.body;

      if (!nombre || !categoria || precio === undefined || stock === undefined) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
      }

      const estado = Number(stock) > 0 ? 'disponible' : 'agotado';
      const productoActualizado = await Producto.actualizar(id, { ...req.body, estado });

      if (!productoActualizado) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      res.status(200).json({ mensaje: 'Producto actualizado', producto: productoActualizado });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const productoEliminado = await Producto.eliminar(id);

      if (!productoEliminado) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
  }
};

module.exports = productoController;