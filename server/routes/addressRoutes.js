const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { saveAddress } = require("../controllers/addressController");

// Guardar dirección de envío (requiere autenticación)
router.post("/save", authMiddleware, saveAddress);

module.exports = router;
