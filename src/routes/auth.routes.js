const express = require('express');
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión (devuelve el access token y deja el refresh token en una cookie)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@drstock.com }
 *               password: { type: string, example: Admin123 }
 *     responses:
 *       200: { description: Sesión iniciada }
 *       401: { description: Correo o contraseña incorrectos }
 *       429: { description: Demasiados intentos }
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Pedir un access token nuevo usando la cookie del refresh token (rotación)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Tokens renovados }
 *       401: { description: Sesión no válida o expirada }
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (revoca el refresh token)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Sesión cerrada }
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Datos del usuario que inició sesión
 *     tags: [Auth]
 *     responses:
 *       200: { description: Usuario actual }
 *       401: { description: Falta el token o expiró }
 */
router.get('/me', verificarToken, authController.me);

module.exports = router;
