// Pruebas del motor de reorden: reviso que las fórmulas den lo que deben dar
const test = require('node:test');
const assert = require('node:assert');
const { calcularReorden } = require('../src/services/reorden.service');

test('si vendo lo mismo todos los días, no necesito stock de seguridad', () => {
  // 30 días vendiendo 2 diarias, el proveedor tarda 3 días
  const ventas = Array(30).fill(2);
  const r = calcularReorden(ventas, 3);

  assert.strictEqual(r.ventas_por_dia, 2);
  assert.strictEqual(r.desviacion, 0);
  assert.strictEqual(r.stock_seguridad, 0);
  assert.strictEqual(r.punto_reorden, 6); // 2 diarias x 3 días = 6
});

test('si las ventas varían mucho, el stock de seguridad sube', () => {
  // 29 días sin vender y 1 día con 12 ventas (el ejemplo de la camiseta M)
  const ventas = Array(29).fill(0);
  ventas.push(12);
  const r = calcularReorden(ventas, 3);

  assert.strictEqual(r.ventas_por_dia, 0.4); // 12 / 30
  assert.strictEqual(r.desviacion, 2.15);
  assert.strictEqual(r.stock_seguridad, 6.2); // 1.65 x 2.15 x raíz de 3
  assert.strictEqual(r.punto_reorden, 8); // 0.4 x 3 + 6.2 = 7.4, redondeo hacia arriba
});

test('si no se vende nada, el punto de reorden es 0', () => {
  const r = calcularReorden(Array(30).fill(0), 3);

  assert.strictEqual(r.ventas_por_dia, 0);
  assert.strictEqual(r.punto_reorden, 0);
});

test('si el proveedor tarda más, el punto de reorden es más alto', () => {
  const ventas = Array(30).fill(2);
  const rapido = calcularReorden(ventas, 3);
  const lento = calcularReorden(ventas, 10);

  assert.ok(lento.punto_reorden > rapido.punto_reorden);
  assert.strictEqual(lento.punto_reorden, 20); // 2 diarias x 10 días
});
