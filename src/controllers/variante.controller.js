const VarianteModel = require('../models/variante.model');

const TALLAS = ['S', 'M', 'L', 'XL', 'U'];

const VarianteController = {
  async getByProducto(req, res) {
    try {
      const variantes = await VarianteModel.findByProducto(req.params.productoId);
      res.json({ success: true, data: variantes });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req, res) {
    try {
      const { producto_id, talla, sku, stock_minimo } = req.body;
      if (!producto_id || !talla || !sku) {
        return res.status(400).json({ success: false, message: 'producto_id, talla y sku son requeridos' });
      }
      if (!TALLAS.includes(talla)) {
        return res.status(400).json({ success: false, message: 'talla debe ser S, M, L, XL o U (única)' });
      }
      const variante = await VarianteModel.create({
        producto_id,
        talla,
        sku: sku.toUpperCase(),
        stock_minimo,
      });
      res.status(201).json({ success: true, data: variante });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'ese SKU o esa talla ya existe para la prenda' });
      }
      if (err.code === '23503') {
        return res.status(404).json({ success: false, message: 'la prenda no existe' });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = VarianteController;