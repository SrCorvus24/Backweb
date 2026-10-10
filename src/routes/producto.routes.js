const { Router } = require('express');
const ProductoController = require('../controllers/producto.controller');

const router = Router();

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar prendas
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de prendas
 *   post:
 *     summary: Crear prenda
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, categoria, precio]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Camiseta oversize
 *               categoria:
 *                 type: string
 *                 example: Camisetas
 *               precio:
 *                 type: number
 *                 example: 100000
 *               tiempo_entrega_dias:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Prenda creada
 */
router.get('/', ProductoController.getAll);
router.post('/', ProductoController.create);

module.exports = router;