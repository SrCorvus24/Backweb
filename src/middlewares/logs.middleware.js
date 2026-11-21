const crypto = require('crypto');

// a cada peticion le pongo un id para poder seguirla en los logs
function logs(req, res, next) {
  // si el cliente ya manda un id lo uso, si no creo uno nuevo
  const id = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.id = id;
  res.setHeader('x-correlation-id', id);

  const inicio = Date.now();

  // cuando termina la respuesta imprimo una linea con todo
  res.on('finish', () => {
    const ms = Date.now() - inicio;
    console.log(`[${id}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next();
}

module.exports = logs;