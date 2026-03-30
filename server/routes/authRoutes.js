const express = require("express");
const router = express.Router();

const { register, login, updateProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
console.log("REGISTER:", register);
console.log("LOGIN:", login);

// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", register);

// POST /api/auth/login - Iniciar sesión
router.post("/login", login);

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;