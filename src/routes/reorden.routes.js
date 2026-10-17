const express = require('express');
const reordenController = require('../controllers/reorden.controller');

const router = express.Router();

/**
 * @swagger
 * /api/reorden/variante/{varianteId}:
 *   get:
 *     summary: Punto de reorden y stock de seguridad de una talla (últimos 30 días)
 *     tags: [Reorden]
 *     parameters:
 *       - in: path
 *         name: varianteId
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200: { description: Cálculo de reorden }
 *       404: { description: La talla no existe }
 */
router.get('/variante/:varianteId', reordenController.getByVariante);

module.exports = router;