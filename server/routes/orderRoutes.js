const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Verificar que authMiddleware es una función
console.log('=== DEBUG orderRoutes ===');
console.log('authMiddleware:', authMiddleware);
console.log('authMiddleware es función?:', typeof authMiddleware === 'function');
console.log('authMiddleware keys:', Object.keys(authMiddleware));

const { 
  createOrder, 
  getUserOrders, 
  getUserOrdersById,
  verifyPurchase 
} = require("../controllers/orderController");

console.log('createOrder:', createOrder);
console.log('getUserOrders:', getUserOrders);

// Rutas públicas
router.get("/user/:userId", getUserOrdersById);

// Rutas protegidas (requieren autenticación)
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getUserOrders);
router.get("/verify-purchase/:productId", authMiddleware, verifyPurchase);

module.exports = router;
