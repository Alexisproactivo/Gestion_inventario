const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.listar);
router.post('/', productoController.crear);
router.put('/:id', productoController.actualizar);
router.delete('/:id', productoController.eliminar);
router.get('/auditoria/historial', productoController.obtenerHistorial);

module.exports = router;