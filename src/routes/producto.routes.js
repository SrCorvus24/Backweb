const { Router } = require('express');
const ProductoController = require('../controllers/producto.controller');

const router = Router();

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 *   post:
 *     summary: Crear producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, unidad]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Aceite 10W-40
 *               unidad:
 *                 type: string
 *                 example: litro
 *               stock_minimo:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.get('/', ProductoController.getAll);
router.post('/', ProductoController.create);

module.exports = router;