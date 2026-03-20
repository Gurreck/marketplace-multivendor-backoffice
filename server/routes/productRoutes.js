const express = require("express");
const {
  createProduct,
  getProducts,
  getVendorProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// DEBUG temporal
console.log('=== DEBUG PRODUCT ROUTES ===');
console.log('createProduct es función?', typeof createProduct === 'function');
console.log('getProducts es función?', typeof getProducts === 'function');
console.log('protect es función?', typeof protect === 'function');
console.log('authorize es función?', typeof authorize === 'function');

// Ruta pública para obtener todos los productos
router.get("/", getProducts);

// Ruta protegida para crear producto (solo vendedor/admin) - soporta hasta 5 imágenes
router.post("/", protect, authorize("vendedor", "administrador"), upload.array("images", 5), createProduct);

// Ruta para obtener "mis productos" como vendedor
router.get("/vendor/me", protect, authorize("vendedor"), getVendorProducts);

// Rutas para producto específico
router.get("/:id", getProductById);
router.put("/:id", protect, authorize("vendedor", "administrador"), upload.array("images", 5), updateProduct);
router.delete("/:id", protect, authorize("vendedor", "administrador"), deleteProduct);

module.exports = router;