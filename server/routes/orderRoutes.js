const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { 
  createOrder, 
  getUserOrders, 
  getUserOrdersById,
  verifyPurchase 
} = require("../controllers/orderController");

// Rutas públicas
router.get("/user/:userId", getUserOrdersById);

// Rutas protegidas (requieren autenticación)
router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getUserOrders);
router.get("/verify-purchase/:productId", verifyToken, verifyPurchase);

module.exports = router;
