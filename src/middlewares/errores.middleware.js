// si la ruta no existe respondo 404 en JSON y no en HTML
function noEncontrado(req, res) {
  res.status(404).json({ success: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
}

// aqui llegan todos los errores que no se atraparon antes
function manejarErrores(err, req, res, next) {
  // JSON mal escrito en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'El JSON enviado no es valido' });
  }

  console.error(`[${req.id}] Error:`, err.message);
  res.status(500).json({ success: false, message: 'Error interno del servidor', id: req.id });
}

module.exports = { noEncontrado, manejarErrores };