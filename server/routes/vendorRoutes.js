const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getVendorDashboard,
  getVendorOrders,
  updateVendorItemStatus,
} = require("../controllers/vendorController");

// Todas las rutas requieren autenticación + rol vendedor
router.use(authMiddleware);
router.use(authorize("vendedor"));

// GET /api/vendor/dashboard — Dashboard con métricas reales
router.get("/dashboard", getVendorDashboard);
// GET /api/vendor/orders — Órdenes donde hay ítems del vendedor
router.get("/orders", getVendorOrders);
// PUT /api/vendor/orders/:orderId/items/:itemId/status — Actualizar estado de un ítem
router.put("/orders/:orderId/items/:itemId/status", updateVendorItemStatus);

module.exports = router;
