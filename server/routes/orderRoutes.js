const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  confirmReceipt,
  sendInvoiceEmail,
  markOrderAsPaid,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/confirm-receipt", protect, confirmReceipt);
router.put("/:id/send-invoice", protect, sendInvoiceEmail);
router.put("/:id/pay", protect, markOrderAsPaid);

module.exports = router;