const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Crear nuevo pedido
// @route   POST /api/orders
// @access  Private (Cliente)
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No hay productos en el pedido" });
    }

    const order = new Order({
      orderItems,
      user: req.user.id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Opcional: Reducir stock de productos
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener pedidos del usuario actual
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener ventas de un vendedor
// @route   GET /api/orders/sales
// @access  Private (Vendedor)
exports.getVendorSales = async (req, res) => {
  try {
    // Buscar pedidos que contengan productos de este vendedor
    const orders = await Order.find({
      "orderItems.vendor": req.user.id,
    }).sort("-createdAt");

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener pedido por ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "nombre email",
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido no encontrado" });
    }

    // Verificar si el usuario es el dueño o es un vendedor con un item en el pedido
    const isOwner = order.user._id.toString() === req.user.id;
    const isVendor = order.orderItems.some(
      (item) => item.vendor.toString() === req.user.id,
    );
    const isAdmin = req.user.role === "administrador";

    if (!isOwner && !isVendor && !isAdmin) {
      return res
        .status(403)
        .json({
          success: false,
          message: "No autorizado para ver este pedido",
        });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
