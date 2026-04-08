const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const fs = require("fs");
const generateInvoicePdf = require("../Utils/generateInvoicePdf");
const sendEmail = require("../Utils/SendEmail");

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, subtotal, shipping, total, paymentMethod, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "La orden debe incluir al menos un producto" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.pais ||
      !shippingAddress.provincia ||
      !shippingAddress.ciudad ||
      !shippingAddress.codigoPostal ||
      !shippingAddress.direccion
    ) {
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

    let discountAmount = 0;
    let couponApplied = null;
    let finalTotal = total;

    if (couponCode) {
      const coupon = await Coupon.findOne({ codigo: couponCode.toUpperCase() });

      if (coupon && !coupon.usado && new Date() <= new Date(coupon.validoHasta)) {
        if (!coupon.usuario || coupon.usuario.toString() === req.user.id.toString()) {
          discountAmount = Math.round(subtotal * (coupon.descuentoPorcentaje / 100));
          finalTotal = Math.max(0, subtotal - discountAmount + shipping);
          couponApplied = coupon._id;

          coupon.usado = true;
          coupon.ordenUsado = null;
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
      statusHistory: [
        {
          estado: "created",
          usuarioQueCambio: req.user.id,
          fecha: new Date(),
          comentario: "Orden creada",
        },
      ],
    });

    if (couponApplied) {
      await Coupon.findByIdAndUpdate(couponApplied, { ordenUsado: order._id });
    }

    const user = await User.findById(req.user.id);
    if (user && !user.firstPurchaseCompleted) {
      user.firstPurchaseCompleted = true;
      await user.save();
    }

    res.status(201).json({ success: true, message: "Orden creada", data: order.toObject() });
  } catch (error) {
    console.error("Error creating order:", error);
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
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching my orders:", error);
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

    const orderUserId = order.user._id || order.user;
    const isOwner = orderUserId.toString().toLowerCase() === req.user.id.toString().toLowerCase();
    const isAdmin = req.user.role === "administrador";
    const isSoporte = req.user.role === "soporte";
    const isVendor = req.user.role === "vendedor";

    if (!isOwner && !isAdmin && !isSoporte && !isVendor) {
      return res.status(403).json({ success: false, message: "No tienes permiso para ver esta orden" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmReceipt = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Orden no encontrada" });
    }

    const orderUserId = order.user._id || order.user;
    const isOwner = orderUserId.toString().toLowerCase() === req.user.id.toString().toLowerCase();
    const isAdmin = req.user.role === "administrador";
    const isSoporte = req.user.role === "soporte";
    const isVendor = req.user.role === "vendedor";

    if (!isOwner && !isAdmin && !isSoporte && !isVendor) {
      return res.status(403).json({ success: false, message: "No autorizado para confirmar esta orden" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ success: false, message: "La orden aún no ha sido entregada" });
    }

    const yaConfirmado = order.statusHistory.some((h) => h.estado === "receipt_confirmed");
    if (yaConfirmado) {
      return res.status(400).json({ success: false, message: "La recepción ya fue confirmada" });
    }

    order.statusHistory.push({
      estado: "receipt_confirmed",
      usuarioQueCambio: req.user.id,
      fecha: new Date(),
      comentario: "Cliente confirmó la recepción del paquete",
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Recepción confirmada exitosamente",
      data: order,
    });
  } catch (error) {
    console.error("Error al confirmar recepción:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

exports.markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "nombre email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    const orderUserId = order.user?._id
      ? order.user._id.toString()
      : order.user.toString();

    const isOwner = orderUserId === req.user.id.toString();
    const isAdmin = req.user.role === "administrador";
    const isSoporte = req.user.role === "soporte";

    if (!isOwner && !isAdmin && !isSoporte) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para marcar como pagada",
      });
    }

    if (!order.user || !order.user.email) {
      return res.status(400).json({
        success: false,
        message: "No se encontró el correo del usuario asociado a la orden",
      });
    }

    if (order.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "La orden ya está marcada como pagada",
      });
    }

    order.status = "paid";
    order.paidAt = new Date();

    order.statusHistory.push({
      estado: "paid",
      usuarioQueCambio: req.user.id,
      fecha: new Date(),
      comentario: "Pago confirmado",
    });

    if (!order.invoiceSent) {
      if (!order.invoiceNumber) {
        order.invoiceNumber = `NXR-${Date.now()}-${String(order._id)
          .slice(-6)
          .toUpperCase()}`;
      }

      const pdfPath = await generateInvoicePdf(order, order.user);

      console.log("👤 Usuario asociado a la orden:", order.user);
      console.log("📧 Correo destino:", order.user.email);
      console.log("📄 Ruta PDF:", pdfPath);
      console.log("📄 Existe PDF:", fs.existsSync(pdfPath));

      await sendEmail({
        email: order.user.email,
        subject: `Factura de tu compra - ${order.invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Factura de compra - Nexora</h2>
            <p>Hola ${order.user.nombre || "cliente"},</p>
            <p>Tu pago ha sido confirmado.</p>
            <p><strong>Factura:</strong> ${order.invoiceNumber}</p>
            <p><strong>Total:</strong> ₡${Number(order.total || 0).toLocaleString("es-CR")}</p>
          </div>
        `,
        attachments: [
          {
            filename: `factura-${order.invoiceNumber}.pdf`,
            path: pdfPath,
          },
        ],
      });

      order.invoiceSent = true;
      order.invoiceSentAt = new Date();

      order.statusHistory.push({
        estado: "invoice_sent",
        usuarioQueCambio: req.user.id,
        fecha: new Date(),
        comentario: "Factura enviada automáticamente",
      });

      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Orden marcada como pagada y factura enviada",
      data: order,
    });
  } catch (error) {
    console.error("Error al marcar como pagada:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "nombre email")
      .populate("items.vendor", "nombre email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    const orderUserId = order.user?._id || order.user;
    const isOwner =
      orderUserId.toString().toLowerCase() === req.user.id.toString().toLowerCase();
    const isAdmin = req.user.role === "administrador";
    const isSoporte = req.user.role === "soporte";

    if (!isOwner && !isAdmin && !isSoporte) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para enviar la factura de esta orden",
      });
    }

    if (!order.user || !order.user.email) {
      return res.status(400).json({
        success: false,
        message: "No se encontró el correo del usuario asociado a la orden",
      });
    }

    if (order.status !== "paid" && !order.paidAt) {
      return res.status(400).json({
        success: false,
        message: "La factura solo se puede enviar cuando la orden ya está pagada",
      });
    }

    if (!order.invoiceNumber) {
      order.invoiceNumber = `NXR-${Date.now()}-${String(order._id).slice(-6).toUpperCase()}`;
    }

    const pdfPath = await generateInvoicePdf(order, order.user);

    console.log("👤 Usuario asociado a la orden:", order.user);
    console.log("📧 Correo destino:", order.user.email);

    await sendEmail({
      email: order.user.email,
      subject: `Factura de tu compra - ${order.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Factura de compra - Nexora</h2>
          <p>Hola ${order.user.nombre || "cliente"},</p>
          <p>Adjuntamos la factura correspondiente a tu compra realizada en Nexora.</p>
          <p><strong>Número de factura:</strong> ${order.invoiceNumber}</p>
          <p><strong>Total pagado:</strong> ₡${Number(order.total || 0).toLocaleString("es-CR")}</p>
          <p>Gracias por comprar con nosotros.</p>
        </div>
      `,
      attachments: [
        {
          filename: `factura-${order.invoiceNumber}.pdf`,
          path: pdfPath,
        },
      ],
    });

    order.invoiceSent = true;
    order.invoiceSentAt = new Date();

    const yaExisteHistorial = order.statusHistory?.some(
      (h) => h.estado === "invoice_sent"
    );

    if (!yaExisteHistorial) {
      order.statusHistory.push({
        estado: "invoice_sent",
        usuarioQueCambio: req.user.id,
        fecha: new Date(),
        comentario: "Factura enviada al correo del cliente",
      });
    }

    await order.save();

    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    return res.status(200).json({
      success: true,
      message: "Factura enviada correctamente al correo del usuario",
      data: order,
    });
  } catch (error) {
    console.error("Error al enviar factura:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error al enviar la factura",
    });
  }
};