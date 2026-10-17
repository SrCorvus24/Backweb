const MovimientoModel = require('../models/movimiento.model');

const movimientoController = {
  async getByVariante(req, res) {
    try {
      const movimientos = await MovimientoModel.findByVariante(req.params.varianteId);
      res.json({ success: true, data: movimientos });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = movimientoController;