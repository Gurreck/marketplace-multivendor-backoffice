const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createOrder, getMyOrders, getOrderById, confirmReceipt } = require("../controllers/orderController");

// Rutas de órdenes
router.post("/", authMiddleware, authorize("cliente"), createOrder);
router.get("/my-orders", authMiddleware, authorize("cliente"), getMyOrders);
router.put("/:id/confirm-receipt", authMiddleware, confirmReceipt);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;
