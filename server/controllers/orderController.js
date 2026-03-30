const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res, next) => {
  try {
    console.log('--- 🛒 PROCESO DE CREACIÓN DE ORDEN ---');
    console.log('ID Usuario (req.user.id):', req.user.id);
    console.log('Tipo de ID Usuario:', typeof req.user.id);
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    const { items, shippingAddress, subtotal, shipping, total } = req.body;

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
      });
    }

    const order = await Order.create({
      user: req.user.id,
      items: preparedItems,
      shippingAddress,
      subtotal,
      shipping,
      total,
      status: "paid",
      paidAt: new Date(),
    });

    console.log('Order created successfully:', order._id);
    res.status(201).json({ success: true, message: "Orden creada y pagada", data: order.toObject() });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    console.log('--- 📋 CONSULTA DE ÓRDENES ---');
    console.log('ID Usuario (req.user.id):', req.user.id);
    
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
    
    console.log(`Órdenes encontradas para el usuario ${req.user.id}: ${orders.length}`);

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
