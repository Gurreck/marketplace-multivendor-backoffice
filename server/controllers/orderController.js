const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res, next) => {
  try {
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
      user: req.user._id,
      items: preparedItems,
      shippingAddress,
      subtotal,
      shipping,
      total,
      status: "paid",
      paidAt: new Date(),
    });

    res.status(201).json({ success: true, message: "Orden creada y pagada", data: order });
  } catch (error) {
    next(error);
  }
};
