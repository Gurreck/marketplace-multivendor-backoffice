const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, subtotal, shipping, total, paymentMethod, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "La orden debe incluir al menos un producto" });
    }

    if (!shippingAddress || !shippingAddress.pais || !shippingAddress.provincia || !shippingAddress.ciudad || !shippingAddress.codigoPostal || !shippingAddress.direccion) {
      return res.status(400).json({ success: false, message: "Datos de dirección incompletos" });
    }

    const preparedItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: "Item inválido en la orden" });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Producto no encontrado: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuficiente para ${product.name}` });
      }

      product.stock -= item.quantity;
      await product.save();

      preparedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images && product.images.length > 0 ? product.images[0].url : null,
        vendor: product.vendor,
      });
    }

    // Validación de cupón
    let discountAmount = 0;
    let couponApplied = null;
    let finalTotal = total;

    if (couponCode) {
      const coupon = await Coupon.findOne({ codigo: couponCode.toUpperCase() });
      if (coupon && !coupon.usado && new Date() <= new Date(coupon.validoHasta)) {
        // Verificar que el cupón pertenece al usuario (si tiene usuario asignado)
        if (!coupon.usuario || coupon.usuario.toString() === req.user.id.toString()) {
          discountAmount = Math.round(subtotal * (coupon.descuentoPorcentaje / 100));
          finalTotal = Math.max(0, subtotal - discountAmount + shipping);
          couponApplied = coupon._id;

          // Marcar cupón como usado
          coupon.usado = true;
          coupon.ordenUsado = null; // Se asignará después
          await coupon.save();
        }
      }
    }

    const order = await Order.create({
      user: req.user.id,
      items: preparedItems,
      shippingAddress,
      subtotal,
      shipping,
      total: couponApplied ? finalTotal : total,
      paymentMethod,
      status: "created",
      discountAmount,
      couponApplied,
      statusHistory: [{
        estado: "created",
        usuarioQueCambio: req.user.id,
        fecha: new Date(),
        comentario: "Orden creada",
      }],
    });

    // Si se aplicó cupón, asignar la orden al cupón
    if (couponApplied) {
      await Coupon.findByIdAndUpdate(couponApplied, { ordenUsado: order._id });
    }

    // Marcar primera compra completada (para gamificación)
    const user = await User.findById(req.user.id);
    if (user && !user.firstPurchaseCompleted) {
      user.firstPurchaseCompleted = true;
      await user.save();
    }

    res.status(201).json({ success: true, message: "Orden creada", data: order.toObject() });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: "items.product",
        select: "images",
      })
      .populate({
        path: "items.vendor",
        select: "nombre",
      })
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: "items.product",
        select: "name images price category",
      })
      .populate({
        path: "items.vendor",
        select: "nombre email",
      })
      .populate("user", "nombre email")
      .populate("statusHistory.usuarioQueCambio", "nombre")
      .populate("couponApplied");

    if (!order) {
      return res.status(404).json({ success: false, message: "Orden no encontrada" });
    }

    // Verificar propiedad (el usuario debe ser dueño, admin o vendedor con items)
    const orderUserId = order.user._id || order.user;
    const isOwner = orderUserId.toString().toLowerCase() === req.user.id.toString().toLowerCase();
    const isAdmin = req.user.role === 'administrador';
    const isSoporte = req.user.role === 'soporte';
    const isVendor = req.user.role === 'vendedor';

    if (!isOwner && !isAdmin && !isSoporte && !isVendor) {
      return res.status(403).json({ success: false, message: "No tienes permiso para ver esta orden" });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    El cliente confirma la recepción del paquete
// @route   PUT /api/orders/:id/confirm-receipt
exports.confirmReceipt = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Orden no encontrada" });
    }

    const orderUserId = order.user._id || order.user;
    const isOwner = orderUserId.toString().toLowerCase() === req.user.id.toString().toLowerCase();
    const isAdmin = req.user.role === 'administrador';
    const isSoporte = req.user.role === 'soporte';
    const isVendor = req.user.role === 'vendedor';

    if (!isOwner && !isAdmin && !isSoporte && !isVendor) {
      return res.status(403).json({ success: false, message: "No autorizado para confirmar esta orden" });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: "La orden aún no ha sido entregada" });
    }

    // Ya fue confirmado antes
    const yaConfirmado = order.statusHistory.some((h) => h.estado === 'receipt_confirmed');
    if (yaConfirmado) {
      return res.status(400).json({ success: false, message: "La recepción ya fue confirmada" });
    }

    // Añadimos receipt_confirmed al historial
    order.statusHistory.push({
      estado: 'receipt_confirmed',
      usuarioQueCambio: req.user.id,
      fecha: new Date(),
      comentario: "Cliente confirmó la recepción del paquete",
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Recepción confirmada exitosamente",
      data: order
    });
  } catch (error) {
    console.error('Error al confirmar recepción:', error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};
