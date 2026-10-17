const salidaService = require('../services/salida.service');

const salidaController = {
  async create(req, res) {
    try {
      const { variante_id, cantidad } = req.body;

      if (!variante_id || !cantidad) {
        return res.status(400).json({ success: false, message: 'variante_id y cantidad son obligatorios' });
      }
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser un entero mayor a 0' });
      }

      const resultado = await salidaService.registrarSalida({ variante_id, cantidad });
      res.status(201).json({ success: true, data: resultado });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

module.exports = salidaController;