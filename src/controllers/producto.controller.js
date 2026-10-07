const ProductoModel = require('../models/producto.model');

const ProductoController = {
  async getAll(req, res) {
    try {
      const productos = await ProductoModel.findAll();
      res.json({ success: true, data: productos });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req, res) {
    try {
      const { nombre, unidad, stock_minimo } = req.body;
      if (!nombre || !unidad) {
        return res.status(400).json({ success: false, message: 'nombre y unidad son requeridos' });
      }
      const producto = await ProductoModel.create({ nombre, unidad, stock_minimo: stock_minimo || 0 });
      res.status(201).json({ success: true, data: producto });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = ProductoController;