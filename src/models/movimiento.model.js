const pool = require('../config/db');

const MovimientoModel = {
  async findByVariante(variante_id) {
    const { rows } = await pool.query(
      'SELECT * FROM movimientos WHERE variante_id = $1 ORDER BY fecha DESC, id DESC',
      [variante_id]
    );
    return rows;
  },
};

module.exports = MovimientoModel;