const pool = require('../config/db');

const ProductoModel = {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM productos ORDER BY id'
    );
    return rows;
  },

  async create({ nombre, categoria, precio, tiempo_entrega_dias }) {
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, categoria, precio, tiempo_entrega_dias)
       VALUES ($1, $2, $3, COALESCE($4, 3)) RETURNING *`,
      [nombre, categoria, precio, tiempo_entrega_dias]
    );
    return rows[0];
  },
};

module.exports = ProductoModel;