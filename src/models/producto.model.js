const pool = require('../config/db');

const ProductoModel = {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM productos ORDER BY id'
    );
    return rows;
  },

  async create({ nombre, unidad, stock_minimo }) {
    const { rows } = await pool.query(
      'INSERT INTO productos (nombre, unidad, stock_minimo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, unidad, stock_minimo]
    );
    return rows[0];
  },
};

module.exports = ProductoModel;