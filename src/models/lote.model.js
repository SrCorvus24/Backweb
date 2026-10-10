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
    const { rows } = await pool.query(
      `INSERT INTO lotes (variante_id, cantidad_inicial, cantidad_disponible, costo_unitario)
       VALUES ($1, $2, $2, $3) RETURNING *`,
      [variante_id, cantidad, costo_unitario]
    );
    return rows[0];
  },
};

module.exports = LoteModel;