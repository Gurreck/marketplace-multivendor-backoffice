const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createOrder, getMyOrders } = require("../controllers/orderController");

// Rutas de órdenes
router.post("/", authMiddleware, authorize("cliente"), createOrder);
router.get("/my-orders", authMiddleware, authorize("cliente"), getMyOrders);

module.exports = router;
