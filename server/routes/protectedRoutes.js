const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Todas las rutas protegidas requieren autenticación
router.use(authMiddleware);

// GET /api/cliente/dashboard - Solo clientes
router.get("/cliente/dashboard", authorize("cliente"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Bienvenido al dashboard de cliente, ${req.user.nombre}.`,
    role: req.user.role,
  });
});

// GET /api/vendedor/dashboard - Solo vendedores
router.get("/vendedor/dashboard", authorize("vendedor"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Bienvenido al dashboard de vendedor, ${req.user.nombre}.`,
    role: req.user.role,
  });
});

// GET /api/admin/dashboard - Solo administradores
router.get("/admin/dashboard", authorize("administrador"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Bienvenido al dashboard de administrador, ${req.user.nombre}.`,
    role: req.user.role,
  });
});

module.exports = router;
