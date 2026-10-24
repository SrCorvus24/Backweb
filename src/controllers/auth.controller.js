const authService = require('../services/auth.service');

// el refresh token viaja en una cookie que el JavaScript del navegador NO puede leer
const OPCIONES_COOKIE = {
  httpOnly: true, // ningún script de la página la puede leer (protege contra XSS)
  sameSite: 'strict', // el navegador solo la manda a mi propio sitio
  secure: process.env.NODE_ENV === 'production', // en producción solo viaja por https
  path: '/api/auth', // solo se manda a las rutas de login, refresh y logout
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
};

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email y password son requeridos' });
      }

      const resultado = await authService.login(email, password);
      res.cookie('refresh_token', resultado.refreshToken, OPCIONES_COOKIE);
      res.json({ success: true, data: { accessToken: resultado.accessToken, usuario: resultado.usuario } });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async refresh(req, res) {
    try {
      const resultado = await authService.refrescar(req.cookies.refresh_token);
      res.cookie('refresh_token', resultado.refreshToken, OPCIONES_COOKIE);
      res.json({ success: true, data: { accessToken: resultado.accessToken, usuario: resultado.usuario } });
    } catch (err) {
      res.clearCookie('refresh_token', { path: OPCIONES_COOKIE.path });
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async logout(req, res) {
    try {
      await authService.logout(req.cookies.refresh_token);
      res.clearCookie('refresh_token', { path: OPCIONES_COOKIE.path });
      res.json({ success: true, message: 'Sesión cerrada' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // devuelve quién soy, sacado del access token
  me(req, res) {
    res.json({ success: true, data: req.usuario });
  },
};

module.exports = authController;
