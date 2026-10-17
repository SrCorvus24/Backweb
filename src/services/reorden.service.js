const pool = require('../config/db');

const Z = 1.65; // 95% de nivel de servicio
const DIAS = 30; // ventana de análisis

// Cálculo puro: recibe las ventas de cada día y el tiempo de entrega
function calcularReorden(ventasDiarias, tiempoEntrega) {
  const n = ventasDiarias.length;
  const promedio = ventasDiarias.reduce((s, v) => s + v, 0) / n;
  const varianza = ventasDiarias.reduce((s, v) => s + (v - promedio) ** 2, 0) / n;
  const desviacion = Math.sqrt(varianza);

  const stockSeguridad = Z * desviacion * Math.sqrt(tiempoEntrega);
  const puntoReorden = promedio * tiempoEntrega + stockSeguridad;

  return {
    ventas_por_dia: Number(promedio.toFixed(2)),
    desviacion: Number(desviacion.toFixed(2)),
    stock_seguridad: Number(stockSeguridad.toFixed(1)),
    punto_reorden: Math.ceil(puntoReorden),
  };
}

async function reordenPorVariante(variante_id) {
  // 1. Datos de la talla: prenda, tiempo de entrega y stock actual
  const { rows: info } = await pool.query(
    `SELECT v.id, v.talla, v.sku, p.nombre, p.tiempo_entrega_dias,
            COALESCE((SELECT SUM(cantidad_disponible) FROM lotes WHERE variante_id = v.id), 0)::int AS stock
     FROM variantes v
     JOIN productos p ON p.id = v.producto_id
     WHERE v.id = $1`,
    [variante_id]
  );

  if (info.length === 0) {
    const error = new Error('La talla (variante) no existe');
    error.status = 404;
    throw error;
  }
  const talla = info[0];

  // 2. Ventas de cada uno de los últimos 30 días (los días sin ventas cuentan como 0)
  const { rows: dias } = await pool.query(
    `SELECT COALESCE(SUM(m.cantidad), 0)::int AS vendido
     FROM generate_series(CURRENT_DATE - ($2::int - 1), CURRENT_DATE, interval '1 day') AS dia
     LEFT JOIN movimientos m
       ON m.variante_id = $1 AND m.tipo = 'SALIDA' AND m.fecha::date = dia::date
     GROUP BY dia
     ORDER BY dia`,
    [variante_id, DIAS]
  );
  const ventasDiarias = dias.map((d) => d.vendido);

  // 3. Calcular
  const calculo = calcularReorden(ventasDiarias, talla.tiempo_entrega_dias);

  return {
    variante_id: talla.id,
    prenda: talla.nombre,
    talla: talla.talla,
    sku: talla.sku,
    stock_actual: talla.stock,
    tiempo_entrega_dias: talla.tiempo_entrega_dias,
    dias_analizados: DIAS,
    ...calculo,
    necesita_reorden: talla.stock <= calculo.punto_reorden,
  };
}

module.exports = { calcularReorden, reordenPorVariante };