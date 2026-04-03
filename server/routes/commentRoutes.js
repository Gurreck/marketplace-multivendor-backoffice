const express = require("express");
const {
  createComment,
  getCommentsByProduct,
  getCommentsByVendor,
  getCommentsByUser,
  deleteComment,
  checkReviewStatus,
} = require("../controllers/commentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Rutas públicas
router.get("/product/:productId", getCommentsByProduct);
router.get("/vendor/:vendorId", getCommentsByVendor);

// Rutas protegidas (requieren autenticación)
router.get("/user", protect, getCommentsByUser);
router.post("/", protect, createComment);
router.get("/status/:productId", protect, checkReviewStatus);
router.delete("/:id", protect, deleteComment);

module.exports = router;
