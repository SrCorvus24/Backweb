const { Router } = require('express');
const LoteController = require('../controllers/lote.controller');

const router = Router();

/**
 * @swagger
 * /api/lotes:
 *   post:
 *     summary: Registrar entrada de mercancía (nuevo lote de una talla)
 *     tags: [Lotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [variante_id, cantidad, costo_unitario]
 *             properties:
 *               variante_id:
 *                 type: integer
 *                 example: 1
 *               cantidad:
 *                 type: integer
 *                 example: 10
 *               costo_unitario:
 *                 type: number
 *                 example: 45000
 *     responses:
 *       201:
 *         description: Lote creado
 *       404:
 *         description: La talla no existe
 * /api/lotes/variante/{varianteId}:
 *   get:
 *     summary: Ver los lotes de una talla (del más antiguo al más nuevo)
 *     tags: [Lotes]
 *     parameters:
 *       - in: path
 *         name: varianteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de lotes en orden PEPS
 */
router.post('/', LoteController.create);
router.get('/variante/:varianteId', LoteController.getByVariante);

module.exports = router;