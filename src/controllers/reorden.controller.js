const reordenService = require('../services/reorden.service');

const reordenController = {
  async getByVariante(req, res) {
    try {
      const resultado = await reordenService.reordenPorVariante(req.params.varianteId);
      res.json({ success: true, data: resultado });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

module.exports = reordenController;