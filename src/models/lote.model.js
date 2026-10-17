const pool = require('../config/db');

const LoteModel = {
  async findByVariante(variante_id) {
    const { rows } = await pool.query(
      'SELECT * FROM lotes WHERE variante_id = $1 ORDER BY fecha_entrada, id',
      [variante_id]
    );
    return rows;
  },

  async create({ variante_id, cantidad, costo_unitario }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Crear el lote
      const { rows } = await client.query(
        `INSERT INTO lotes (variante_id, cantidad_inicial, cantidad_disponible, costo_unitario)
         VALUES ($1, $2, $2, $3) RETURNING *`,
        [variante_id, cantidad, costo_unitario]
      );
      const lote = rows[0];

      // 2. Registrar la ENTRADA en el historial
      await client.query(
        `INSERT INTO movimientos (variante_id, lote_id, tipo, cantidad, costo_unitario)
         VALUES ($1, $2, 'ENTRADA', $3, $4)`,
        [variante_id, lote.id, cantidad, costo_unitario]
      );

      await client.query('COMMIT');
      return lote;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = LoteModel;