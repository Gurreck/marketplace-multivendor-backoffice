const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
console.log("REGISTER:", register);
console.log("LOGIN:", login);


// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", register);

// POST /api/auth/login - Iniciar sesión
router.post("/login", login);

module.exports = router;
