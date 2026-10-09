const { Router } = require('express');
const LoteController = require('../controllers/lote.controller');

const router = Router();

/**
 * @swagger
 * /api/lotes:
 *   post:
 *     summary: Registrar entrada de mercancía (nuevo lote)
 *     tags: [Lotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto_id, cantidad, costo_unitario]
 *             properties:
 *               producto_id:
 *                 type: integer
 *                 example: 1
 *               cantidad:
 *                 type: number
 *                 example: 10
 *               costo_unitario:
 *                 type: number
 *                 example: 20000
 *     responses:
 *       201:
 *         description: Lote creado
 * /api/lotes/producto/{productoId}:
 *   get:
 *     summary: Ver lotes de un producto
 *     tags: [Lotes]
 *     parameters:
 *       - in: path
 *         name: productoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de lotes (del más viejo al más nuevo)
 */
router.post('/', LoteController.create);
router.get('/producto/:productoId', LoteController.getByProducto);

module.exports = router;