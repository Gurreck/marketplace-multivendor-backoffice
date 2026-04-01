const express = require("express");
const router = express.Router();

const { register, login, updateProfile, getProfile, uploadProfilePicture } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
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

// PUT /api/auth/profile/picture - Actualizar foto de perfil
router.put("/profile/picture", authMiddleware, upload.single("profilePicture"), uploadProfilePicture);

module.exports = router;