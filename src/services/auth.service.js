const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const UserModel = require('../models/user.model');

const DURACION_ACCESS = '15m'; // el access token dura 15 minutos
const DIAS_REFRESH = 7; // el refresh token dura 7 días

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// el refresh token no se guarda tal cual en la base, se guarda su "huella" (hash)
// así, si alguien roba la base de datos, no puede usar esas sesiones
function huella(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// lo que le devuelvo al front del usuario (nunca la contraseña)
function datosPublicos(usuario) {
  return { id: usuario.id, name: usuario.name, email: usuario.email, rol: usuario.rol };
}

// creo los dos tokens: el access (JWT) y el refresh (texto al azar que guardo en sesiones)
async function crearTokens(usuario) {
  const accessToken = jwt.sign(
    { id: usuario.id, name: usuario.name, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: DURACION_ACCESS }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expira = new Date();
  expira.setDate(expira.getDate() + DIAS_REFRESH);

  await pool.query(
    'INSERT INTO sesiones (user_id, token_hash, expira) VALUES ($1, $2, $3)',
    [usuario.id, huella(refreshToken), expira]
  );

  return { accessToken, refreshToken };
}

async function login(email, password) {
  const usuario = await UserModel.findByEmail(email);

  // el mismo mensaje si no existe o si la clave está mal: así no le digo a un atacante cuál falló
  if (!usuario) {
    throw crearError('Correo o contraseña incorrectos', 401);
  }
  const correcta = await bcrypt.compare(password, usuario.password);
  if (!correcta) {
    throw crearError('Correo o contraseña incorrectos', 401);
  }

  const tokens = await crearTokens(usuario);
  return { ...tokens, usuario: datosPublicos(usuario) };
}

async function refrescar(refreshToken) {
  if (!refreshToken) {
    throw crearError('No hay sesión activa', 401);
  }

  // ROTACIÓN: marco el token como usado en el mismo paso en que lo reviso.
  // Si llegan dos pedidos al tiempo con el mismo token, solo uno lo logra.
  const { rows } = await pool.query(
    `UPDATE sesiones SET revocado = true
     WHERE token_hash = $1 AND revocado = false AND expira > NOW()
     RETURNING user_id`,
    [huella(refreshToken)]
  );

  if (rows.length === 0) {
    // si el token existe pero ya estaba usado, alguien lo está reutilizando (posible robo):
    // cierro TODAS las sesiones de ese usuario
    const { rows: usadas } = await pool.query(
      'SELECT user_id FROM sesiones WHERE token_hash = $1 AND revocado = true',
      [huella(refreshToken)]
    );
    if (usadas.length > 0) {
      await pool.query('UPDATE sesiones SET revocado = true WHERE user_id = $1', [usadas[0].user_id]);
    }
    throw crearError('La sesión no es válida o expiró, vuelve a iniciar sesión', 401);
  }

  const usuario = await UserModel.findById(rows[0].user_id);
  if (!usuario) {
    throw crearError('El usuario ya no existe', 401);
  }

  const tokens = await crearTokens(usuario);
  return { ...tokens, usuario: datosPublicos(usuario) };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await pool.query('UPDATE sesiones SET revocado = true WHERE token_hash = $1', [huella(refreshToken)]);
}

module.exports = { login, refrescar, logout };
