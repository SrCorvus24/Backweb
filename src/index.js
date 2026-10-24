require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const runMigrations = require('./config/migrate');
const { verificarToken } = require('./middlewares/auth.middleware');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productoRoutes = require('./routes/producto.routes');
const varianteRoutes = require('./routes/variante.routes');
const loteRoutes = require('./routes/lote.routes');
const salidaRoutes = require('./routes/salida.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const reordenRoutes = require('./routes/reorden.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser()); // para leer la cookie del refresh token
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8100'],
  credentials: true, // deja que el navegador mande la cookie
}));

// máximo 10 intentos de login cada 15 minutos por IP (contra ataques de fuerza bruta)
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos, espera 15 minutos' },
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// rutas públicas: login, refresh y logout
app.use('/api/auth/login', limiteLogin);
app.use('/api/auth', authRoutes);

// rutas protegidas: todas piden un access token válido
app.use('/api/users', verificarToken, userRoutes);
app.use('/api/productos', verificarToken, productoRoutes);
app.use('/api/variantes', verificarToken, varianteRoutes);
app.use('/api/lotes', verificarToken, loteRoutes);
app.use('/api/salidas', verificarToken, salidaRoutes);
app.use('/api/movimientos', verificarToken, movimientoRoutes);
app.use('/api/reorden', verificarToken, reordenRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API corriendo', docs: '/api-docs' });
});

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('Falta JWT_SECRET en el archivo .env');
    }
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
      console.log(`Swagger en  http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
