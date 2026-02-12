const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(getProducts) // PÚBLICO: Obtener todos los productos
  .post(protect, authorize("vendedor", "administrador"), createProduct);

// Nueva ruta para obtener "mis productos" como vendedor
router.get("/vendor/me", protect, authorize("vendedor"), getProducts);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, authorize("vendedor", "administrador"), updateProduct)
  .delete(protect, authorize("vendedor", "administrador"), deleteProduct);

module.exports = router;
