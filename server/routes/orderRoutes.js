const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getVendorSales,
  getOrderById,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(protect);

router
  .route("/")
  .post(authorize("cliente", "vendedor", "administrador"), createOrder);

router.get("/myorders", getMyOrders);
router.get("/sales", authorize("vendedor", "administrador"), getVendorSales);
router.get("/:id", getOrderById);

module.exports = router;
