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
      const { nombre, categoria, precio, tiempo_entrega_dias } = req.body;
      if (!nombre || !categoria || !precio) {
        return res.status(400).json({ success: false, message: 'nombre, categoria y precio son requeridos' });
      }
      if (precio <= 0) {
        return res.status(400).json({ success: false, message: 'el precio debe ser mayor a 0' });
      }
      const producto = await ProductoModel.create({ nombre, categoria, precio, tiempo_entrega_dias });
      res.status(201).json({ success: true, data: producto });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = ProductoController;