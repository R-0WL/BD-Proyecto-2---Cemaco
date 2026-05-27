
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Sesión requerida. Por favor inicia sesión.' });
  }
  next();
}


function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Sesión requerida. Por favor inicia sesión.' });
    }
    const userRole = req.session.user.rol;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}. Tu rol: ${userRole}.`
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
