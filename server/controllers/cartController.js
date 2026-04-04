const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Obtener el carrito del usuario
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      populate: { path: "vendor", select: "nombre email" }
    });
    if (!cart) {
      return res.json({ success: true, data: { items: [] } });
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// @desc    Agregar producto al carrito
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    // Verificar que el producto existe y tiene stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Stock insuficiente. Disponible: ${product.stock}` });
    }

    // Buscar o crear carrito del usuario
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{
          product: productId,
          name: product.name,
          price: product.price,
          quantity: quantity
        }]
      });
    } else {
      // Verificar si el producto ya está en el carrito
      const existingItem = cart.items.find(item => item.product.toString() === productId);

      if (existingItem) {
        // Si existe, actualizar cantidad
        existingItem.quantity += quantity;
      } else {
        // Si no existe, agregar nuevo item
        cart.items.push({
          product: productId,
          name: product.name,
          price: product.price,
          quantity: quantity
        });
      }

      await cart.save();
    }

    // Poblar el producto para la respuesta
    await cart.populate({
      path: "items.product",
      populate: { path: "vendor", select: "nombre email" }
    });

    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// @desc    Actualizar cantidad de un producto en el carrito
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Cantidad inválida" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Carrito no encontrado" });
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Producto no encontrado en el carrito" });
    }

    // Verificar stock disponible
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Stock insuficiente. Disponible: ${product.stock}` });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate({
      path: "items.product",
      populate: { path: "vendor", select: "nombre email" }
    });

    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Error al actualizar carrito:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// @desc    Eliminar producto del carrito
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Carrito no encontrado" });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate({
      path: "items.product",
      populate: { path: "vendor", select: "nombre email" }
    });

    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// @desc    Limpiar carrito completo
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ success: true, data: { items: [] } });
  } catch (error) {
    console.error("Error al limpiar carrito:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};