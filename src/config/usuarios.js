require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

// un usuario de prueba por cada rol
const usuarios = [
  { name: 'Xander Rodriguez Osorio', email: 'admin@drstock.com', password: 'Admin123', rol: 'ADMINISTRADOR' },
  { name: 'Almacenista DrStock', email: 'almacen@drstock.com', password: 'Almacen123', rol: 'ALMACENISTA' },
  { name: 'Consulta DrStock', email: 'consulta@drstock.com', password: 'Consulta123', rol: 'CONSULTA' },
];

async function crearUsuarios() {
  try {
    for (const u of usuarios) {
      const clave = await bcrypt.hash(u.password, 10);

      // si el correo ya existe, solo le actualizo la clave y el rol
      await pool.query(
        `INSERT INTO users (name, email, password, rol) VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET password = $3, rol = $4`,
        [u.name, u.email, clave, u.rol]
      );
      console.log(`Usuario listo: ${u.email} (${u.rol})`);
    }
  } catch (err) {
    console.error('Error al crear usuarios:', err.message);
  } finally {
    await pool.end();
  }
}

crearUsuarios();
