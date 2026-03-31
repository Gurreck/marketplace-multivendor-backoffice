const express = require("express");
const {
  createComment,
  getCommentsByProduct,
  deleteComment,
  checkReviewStatus,
} = require("../controllers/commentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Rutas públicas
router.get("/product/:productId", getCommentsByProduct);

// Rutas protegidas (requieren autenticación)
router.post("/", protect, createComment);
router.get("/status/:productId", protect, checkReviewStatus);
router.delete("/:id", protect, deleteComment);

module.exports = router;
