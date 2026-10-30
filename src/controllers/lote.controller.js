const LoteModel = require('../models/lote.model');

const LoteController = {
  async getByVariante(req, res) {
    try {
      const lotes = await LoteModel.findByVariante(req.params.varianteId);
      res.json({ success: true, data: lotes });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req, res) {
    try {
      const { variante_id, cantidad, costo_unitario } = req.body;
      if (!variante_id || !cantidad || !costo_unitario) {
        return res.status(400).json({ success: false, message: 'variante_id, cantidad y costo_unitario son requeridos' });
      }
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({ success: false, message: 'la cantidad debe ser un número entero mayor a 0' });
      }
      if (costo_unitario <= 0) {
        return res.status(400).json({ success: false, message: 'el costo unitario debe ser mayor a 0' });
      }
      const lote = await LoteModel.create({ variante_id, cantidad, costo_unitario });
      res.status(201).json({ success: true, data: lote });
    } catch (err) {
      if (err.code === '23503') {
        return res.status(404).json({ success: false, message: 'la talla (variante) no existe' });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = LoteController;