const pool = require('../config/db');

async function registrarSalida({ variante_id, cantidad }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Traer los lotes de esa talla, del más antiguo al más nuevo (PEPS)
    const { rows: lotes } = await client.query(
      `SELECT id, cantidad_disponible, costo_unitario
       FROM lotes
       WHERE variante_id = $1 AND cantidad_disponible > 0
       ORDER BY fecha_entrada, id
       FOR UPDATE`,
      [variante_id]
    );

    // 2. Revisar si alcanza el stock
    const disponible = lotes.reduce((suma, l) => suma + l.cantidad_disponible, 0);
    if (disponible < cantidad) {
      const error = new Error(`Solo hay ${disponible} unidades disponibles`);
      error.status = 409;
      throw error;
    }

    // 3. Descontar lote por lote hasta completar la cantidad
    let pendiente = cantidad;
    const detalle = [];

    for (const lote of lotes) {
      if (pendiente === 0) break;
      const sale = Math.min(pendiente, lote.cantidad_disponible);

      await client.query(
        'UPDATE lotes SET cantidad_disponible = cantidad_disponible - $1 WHERE id = $2',
        [sale, lote.id]
      );

      await client.query(
        `INSERT INTO movimientos (variante_id, lote_id, tipo, cantidad, costo_unitario)
         VALUES ($1, $2, 'SALIDA', $3, $4)`,
        [variante_id, lote.id, sale, lote.costo_unitario]
      );

      detalle.push({ lote_id: lote.id, cantidad: sale, costo_unitario: Number(lote.costo_unitario) });
      pendiente -= sale;
    }

    // 4. Todo salió bien: guardar los cambios
    await client.query('COMMIT');

    const costo_total = detalle.reduce((s, d) => s + d.cantidad * d.costo_unitario, 0);
    return { variante_id, cantidad, costo_total, detalle };
  } catch (err) {
    // Si algo falló: deshacer todo
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { registrarSalida };