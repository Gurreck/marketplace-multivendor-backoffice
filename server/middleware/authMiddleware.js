const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware de autenticación - Verifica JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar que el header Authorization exista
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Acceso denegado. No se proporcionó un token de autenticación.",
      });
    }

    // Extraer el token
    const token = authHeader.split(" ")[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario y adjuntarlo al request
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token inválido. El usuario no existe.",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      nombre: user.nombre,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "El token ha expirado. Inicia sesión nuevamente.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token inválido.",
    });
  }
};

module.exports = authMiddleware;
