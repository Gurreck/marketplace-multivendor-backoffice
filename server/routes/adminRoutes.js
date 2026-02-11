const express = require("express");
const router = express.Router();
const { getUsers, assignRole } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Todas las rutas requieren autenticación + rol administrador
router.use(authMiddleware);
router.use(authorize("administrador"));

// GET /api/admin/users - Obtener todos los usuarios
router.get("/users", getUsers);

// PUT /api/admin/users/:id/role - Asignar rol a un usuario
router.put("/users/:id/role", assignRole);

module.exports = router;
