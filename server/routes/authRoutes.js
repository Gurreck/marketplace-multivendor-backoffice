const express = require("express");
const router = express.Router();

const { register, login, updateProfile, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
console.log("REGISTER:", register);
console.log("LOGIN:", login);

// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", register);

// POST /api/auth/login - Iniciar sesión
router.post("/login", login);

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put("/profile", authMiddleware, updateProfile);

// GET /api/auth/profile - Obtener perfil del usuario (actualizado para consistencia)
router.get("/profile", authMiddleware, getProfile);

module.exports = router;