const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createOrder } = require("../controllers/orderController");

// Solo clientes pueden crear órdenes desde la pasarela de pagos
router.post("/", authMiddleware, authorize("cliente"), createOrder);

module.exports = router;
