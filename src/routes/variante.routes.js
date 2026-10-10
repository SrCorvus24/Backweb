const { Router } = require('express');
const VarianteController = require('../controllers/variante.controller');

const router = Router();

/**
 * @swagger
 * /api/variantes:
 *   post:
 *     summary: Agregar una talla a una prenda
 *     tags: [Variantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto_id, talla, sku]
 *             properties:
 *               producto_id:
 *                 type: integer
 *                 example: 1
 *               talla:
 *                 type: string
 *                 example: M
 *               sku:
 *                 type: string
 *                 example: CAM-OVR-M
 *               stock_minimo:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Talla creada
 *       409:
 *         description: SKU o talla repetida
 * /api/variantes/producto/{productoId}:
 *   get:
 *     summary: Ver las tallas de una prenda con su stock
 *     tags: [Variantes]
 *     parameters:
 *       - in: path
 *         name: productoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tallas con stock calculado
 */
router.post('/', VarianteController.create);
router.get('/producto/:productoId', VarianteController.getByProducto);

module.exports = router;