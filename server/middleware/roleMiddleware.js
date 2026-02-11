// Middleware de autorización por roles
// Uso: authorize('administrador') o authorize('vendedor', 'administrador')
const authorize = (...roles) => {
  return (req, res, next) => {
    // Verificar que el middleware de autenticación ya se ejecutó
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Debe autenticarse primero.",
      });
    }

    // Verificar que el rol del usuario está en la lista de roles permitidos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(", ")}. Tu rol actual es: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = authorize;
