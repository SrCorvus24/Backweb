// Pruebas del portero: reviso que cada rol solo pueda entrar a donde le toca
const test = require('node:test');
const assert = require('node:assert');
const { verificarToken, permitirRoles } = require('../src/middlewares/auth.middleware');

// simulo la respuesta de Express para saber qué código devolvió
function respuestaFalsa() {
  return {
    codigo: 200,
    status(c) {
      this.codigo = c;
      return this;
    },
    json() {
      return this;
    },
  };
}

test('sin token, el portero responde 401', () => {
  const req = { headers: {} };
  const res = respuestaFalsa();
  let paso = false;

  verificarToken(req, res, () => { paso = true; });

  assert.strictEqual(res.codigo, 401);
  assert.strictEqual(paso, false);
});

test('con un token falso, el portero responde 401', () => {
  process.env.JWT_SECRET = 'clave-de-prueba';
  const req = { headers: { authorization: 'Bearer token-inventado' } };
  const res = respuestaFalsa();

  verificarToken(req, res, () => {});

  assert.strictEqual(res.codigo, 401);
});

test('el rol CONSULTA no puede vender (403)', () => {
  const req = { usuario: { rol: 'CONSULTA' } };
  const res = respuestaFalsa();
  let paso = false;

  permitirRoles('ADMINISTRADOR', 'ALMACENISTA')(req, res, () => { paso = true; });

  assert.strictEqual(res.codigo, 403);
  assert.strictEqual(paso, false);
});

test('el rol ALMACENISTA sí puede vender', () => {
  const req = { usuario: { rol: 'ALMACENISTA' } };
  const res = respuestaFalsa();
  let paso = false;

  permitirRoles('ADMINISTRADOR', 'ALMACENISTA')(req, res, () => { paso = true; });

  assert.strictEqual(paso, true);
});
