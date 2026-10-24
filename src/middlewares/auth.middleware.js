const jwt = require('jsonwebtoken');

// revisa que el pedido traiga un access token válido: "Authorization: Bearer <token>"
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Falta el token de acceso' });
  }

  try {
    // si el token es válido, guardo los datos del usuario para usarlos después
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
}

// deja pasar solo a los roles que yo diga, ej: permitirRoles('ADMINISTRADOR', 'ALMACENISTA')
function permitirRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, permitirRoles };
