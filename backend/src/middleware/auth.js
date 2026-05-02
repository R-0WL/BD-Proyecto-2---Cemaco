// ============================================================
// MIDDLEWARE/AUTH.JS — Autenticación simplificada (sin JWT)
// ============================================================
// [COMENTADO - JWT desactivado]
// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey2026';
//
// function authMiddlewareJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Token de autenticación requerido' });
//   }
//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Token inválido o expirado' });
//   }
// }
//
// function generateToken(payload) {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
// }

// ── Middleware simple: siempre permite pasar (sin token) ──
function authMiddleware(req, res, next) {
  // Sin validación de token — acceso libre para todas las rutas protegidas
  next();
}

// Exportamos authMiddleware como antes para que todos los routers no rompan
// generateToken ya no se usa, pero se exporta vacío por compatibilidad
function generateToken(payload) {
  return 'no-token';
}
//function authMiddleware(req, res, next) {
//  const authHeader = req.headers.authorization;
//  if (!authHeader || !authHeader.startsWith('Bearer ')) {
//    return res.status(401).json({ error: 'Token de autenticación requerido' });
//  }
//  const token = authHeader.split(' ')[1];
//  try {
//    const decoded = jwt.verify(token, JWT_SECRET);
//    req.user = decoded;
//    next(
//  );
//  } catch (err) {
//    return res.status(401).json({ error: 'Token inválido o expirado' });
//  }
//}

//function generateToken(payload) {
//  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
//}

//module.exports = { authMiddleware, generateToken, JWT_SECRET };
module.exports = { authMiddleware, generateToken };