const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  spinWheel,
  validateCoupon,
} = require("../controllers/gamificationController");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// POST /api/gamification/spin — Girar la ruleta
router.post("/spin", spinWheel);
// GET /api/gamification/validate — Validar cupón
router.get("/validate", validateCoupon);

module.exports = router;
