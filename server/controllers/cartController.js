const Cart = require("../models/Cart");

// @desc    Obtener carrito del usuario
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Actualizar/Sincronizar carrito
// @route   POST /api/cart
// @access  Private
exports.updateCart = async (req, res) => {
  try {
    const { items } = req.body; // Array de { product, quantity }

    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = items;
      await cart.save();
    } else {
      cart = await Cart.create({ user: req.user.id, items });
    }

    const updatedCart = await Cart.findById(cart._id).populate("items.product");
    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vaciar carrito
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: "Carrito vaciado" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
