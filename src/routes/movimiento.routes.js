const express = require('express');
const movimientoController = require('../controllers/movimiento.controller');

const router = express.Router();

/**
 * @swagger
 * /api/movimientos/variante/{varianteId}:
 *   get:
 *     summary: Historial de entradas y salidas de una talla (más reciente primero)
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: varianteId
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200: { description: Lista de movimientos }
 */
router.get('/variante/:varianteId', movimientoController.getByVariante);

module.exports = router;