const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Todas las rutas de carrito requieren autenticación
router.use(protect);

// Obtener carrito del usuario
router.get("/", getCart);

// Agregar producto al carrito
router.post("/", addToCart);

// Actualizar cantidad de producto en carrito
router.put("/:productId", updateCartItem);

// Eliminar producto del carrito
router.delete("/:productId", removeFromCart);

// Limpiar carrito completo
router.delete("/", clearCart);

module.exports = router;