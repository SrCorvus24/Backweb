const pool = require('../config/db');

const VarianteModel = {
  async findByProducto(producto_id) {
    const { rows } = await pool.query(
      `SELECT v.*, COALESCE(SUM(l.cantidad_disponible), 0)::int AS stock
       FROM variantes v
       LEFT JOIN lotes l ON l.variante_id = v.id
       WHERE v.producto_id = $1
       GROUP BY v.id
       ORDER BY v.id`,
      [producto_id]
    );
    return rows;
  },

  async create({ producto_id, talla, sku, stock_minimo }) {
    const { rows } = await pool.query(
      `INSERT INTO variantes (producto_id, talla, sku, stock_minimo)
       VALUES ($1, $2, $3, COALESCE($4, 0)) RETURNING *`,
      [producto_id, talla, sku, stock_minimo]
    );
    return rows[0];
  },
};

module.exports = VarianteModel;