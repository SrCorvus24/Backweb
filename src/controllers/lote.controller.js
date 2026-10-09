const LoteModel = require('../models/lote.model');

const LoteController = {
  async getByProducto(req, res) {
    try {
      const lotes = await LoteModel.findByProducto(req.params.productoId);
      res.json({ success: true, data: lotes });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req, res) {
    try {
      const { producto_id, cantidad, costo_unitario } = req.body;
      if (!producto_id || !cantidad || !costo_unitario) {
        return res.status(400).json({ success: false, message: 'producto_id, cantidad y costo_unitario son requeridos' });
      }
      if (cantidad <= 0 || costo_unitario <= 0) {
        return res.status(400).json({ success: false, message: 'cantidad y costo_unitario deben ser mayores a 0' });
      }
      const lote = await LoteModel.create({ producto_id, cantidad, costo_unitario });
      res.status(201).json({ success: true, data: lote });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = LoteController;