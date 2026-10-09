require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const runMigrations = require('./config/migrate');
const userRoutes = require('./routes/user.routes');
const productoRoutes = require('./routes/producto.routes');
const loteRoutes = require('./routes/lote.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', userRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/lotes', loteRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API corriendo', docs: '/api-docs' });
});

async function start() {
  try {
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