const pool = require('../config/db');

const LoteModel = {
  async findByProducto(producto_id) {
    const { rows } = await pool.query(
      'SELECT * FROM lotes WHERE producto_id = $1 ORDER BY fecha_entrada',
      [producto_id]
    );
    return rows;
  },

  async create({ producto_id, cantidad, costo_unitario }) {
    const { rows } = await pool.query(
      `INSERT INTO lotes (producto_id, cantidad_inicial, cantidad_disponible, costo_unitario)
       VALUES ($1, $2, $2, $3) RETURNING *`,
      [producto_id, cantidad, costo_unitario]
    );
    return rows[0];
  },
};

module.exports = LoteModel;