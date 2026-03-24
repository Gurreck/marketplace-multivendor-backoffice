const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Crear un nuevo pedido
// @route   POST /api/orders
// @access  Private (solo clientes autenticados)
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentDetails } = req.body;

    // Verificar que hay productos
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay productos en el pedido",
      });
    }

    // Verificar que el usuario existe
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autorizado",
      });
    }

    // Verificar disponibilidad de stock y calcular precio total
    let orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto no encontrado: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}`,
        });
      }

      // Reducir stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      calculatedTotal += product.price * item.quantity;
    }

    // Crear el pedido
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentDetails: {
        lastFourDigits: paymentDetails?.lastFourDigits,
        cardType: paymentDetails?.cardType,
      },
      status: "pagado",
    });

    // Poblar información de productos para la respuesta
    await order.populate("items.product", "name images");

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error en createOrder:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener pedidos del usuario actual
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error en getUserOrders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener pedidos de un usuario específico (para verificar compras)
// @route   GET /api/orders/user/:userId
// @access  Private
const getUserOrdersById = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error en getUserOrdersById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verificar si el usuario ha comprado un producto
// @route   GET /api/orders/verify-purchase/:productId
// @access  Private
const verifyPurchase = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Buscar pedidos que contengan el producto
    const order = await Order.findOne({
      user: userId,
      "items.product": productId,
      status: { $in: ["pagado", "enviado", "entregado"] },
    });

    res.status(200).json({
      success: true,
      hasPurchased: !!order,
      data: order,
    });
  } catch (error) {
    console.error("Error en verifyPurchase:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getUserOrdersById,
  verifyPurchase,
};
