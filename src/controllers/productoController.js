const Producto = require('../models/productoModel');
const Auditoria = require('../models/auditoriaModel');

const productoController = {
  listar: async (req, res) => {
    try {
      const pagina = parseInt(req.query.pagina, 10) || 1;
      const limite = parseInt(req.query.limite, 10) || 5;
      const busqueda = req.query.busqueda || '';
      const categoria = req.query.categoria || 'todas';
      const offset = (pagina - 1) * limite;

      const resultado = await Producto.obtenerPaginados({ limite, offset, busqueda, categoria });

      res.status(200).json({
        datos: resultado.productos,
        paginacion: {
          totalItems: resultado.total,
          totalPaginas: resultado.totalPaginas,
          paginaActual: pagina,
          limite
        },
        stats: resultado.stats,
        categorias: resultado.categorias
      });
    } catch (error) {
      console.error('Error al listar:', error);
      res.status(500).json({ mensaje: 'Error al consultar productos' });
    }
  },

  crear: async (req, res) => {
    try {
      const { nombre, categoria, precio, stock, usuarioId } = req.body;

      if (!nombre || !categoria || precio === undefined || stock === undefined) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
      }

      const nuevoProducto = await Producto.crear(req.body);

      // REGISTRO DE AUDITORÍA
      await Auditoria.registrar({
        usuarioId: usuarioId || null,
        accion: 'CREACION',
        productoId: nuevoProducto.id,
        detalles: `Creó el producto "${nombre}" (Stock: ${stock}, Precio: S/ ${precio})`
      });

      res.status(201).json({ mensaje: 'Producto creado con éxito', producto: nuevoProducto });
    } catch (error) {
      console.error('Error al registrar producto:', error);
      res.status(500).json({ mensaje: 'Error al registrar el producto' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, categoria, precio, stock, usuarioId } = req.body;

      const estado = Number(stock) > 0 ? 'disponible' : 'agotado';
      const productoActualizado = await Producto.actualizar(id, { ...req.body, estado });

      if (!productoActualizado) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      // REGISTRO DE AUDITORÍA
      await Auditoria.registrar({
        usuarioId: usuarioId || null,
        accion: 'EDICION',
        productoId: id,
        detalles: `Actualizó "${nombre}" a Stock: ${stock}, Precio: S/ ${precio}`
      });

      res.status(200).json({ mensaje: 'Producto actualizado', producto: productoActualizado });
    } catch (error) {
      console.error('Error al actualizar:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      // Extraemos usuarioId enviado por query o header
      const usuarioId = req.query.usuarioId || null;

      const productoEliminado = await Producto.eliminar(id);

      if (!productoEliminado) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      // REGISTRO DE AUDITORÍA
      await Auditoria.registrar({
        usuarioId,
        accion: 'ELIMINACION',
        productoId: id,
        detalles: `Eliminó el producto #${id} (${productoEliminado.nombre || 'Sin nombre'})`
      });

      res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
  },

  // Endpoint exclusivo para ver el historial
  obtenerHistorial: async (req, res) => {
    try {
      const historial = await Auditoria.listarRecientes(30);
      res.status(200).json(historial);
    } catch (error) {
      console.error('Error al traer auditoría:', error);
      res.status(500).json({ mensaje: 'Error al cargar bitácora de auditoría' });
    }
  }
};

module.exports = productoController;