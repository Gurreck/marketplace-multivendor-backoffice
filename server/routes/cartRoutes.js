const express = require("express");
const router = express.Router();
const {
  getCart,
  updateCart,
  clearCart,
} = require("../controllers/cartController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getCart).post(updateCart).delete(clearCart);

module.exports = router;
