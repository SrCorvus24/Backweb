const express = require('express');
const salidaController = require('../controllers/salida.controller');
const { permitirRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/salidas:
 *   post:
 *     summary: Registrar salida (venta) descontando por PEPS
 *     tags: [Salidas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [variante_id, cantidad]
 *             properties:
 *               variante_id: { type: integer, example: 1 }
 *               cantidad: { type: integer, example: 3 }
 *     responses:
 *       201: { description: Salida registrada }
 *       400: { description: Datos inválidos }
 *       409: { description: Stock insuficiente }
 */
router.post('/', permitirRoles('ADMINISTRADOR', 'ALMACENISTA'), salidaController.create);

module.exports = router;