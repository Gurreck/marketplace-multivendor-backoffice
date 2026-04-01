const Order = require("../models/Order");
const Product = require("../models/Product");
const { registrarAuditoria } = require("./adminController");

// @desc    Dashboard del vendedor con métricas reales
// @route   GET /api/vendor/dashboard
const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Obtener productos del vendedor
    const vendorProducts = await Product.find({ vendor: vendorId, isActive: true });
    const productIds = vendorProducts.map((p) => p._id);

    // Buscar órdenes que contienen productos de este vendedor
    const vendorOrders = await Order.find({
      "items.vendor": vendorId,
      status: { $in: ["paid", "packed", "shipped", "delivered"] },
    });

    // Calcular ventas totales (solo los ítems del vendedor)
    let ventasTotales = 0;
    let totalOrdenes = 0;
    const ordenesPendientes = [];

    vendorOrders.forEach((order) => {
      let tieneItems = false;
      order.items.forEach((item) => {
        if (item.vendor && item.vendor.toString() === vendorId.toString()) {
          ventasTotales += item.price * item.quantity;
          tieneItems = true;
        }
      });
      if (tieneItems) {
        totalOrdenes++;
        if (["paid", "packed"].includes(order.status)) {
          ordenesPendientes.push(order);
        }
      }
    });

    // Productos con bajo stock
    const lowStockProducts = vendorProducts.filter(
      (p) => p.stock <= p.lowStockThreshold
    );

    // Datos de ventas mensuales (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const ventasPorMes = await Order.aggregate([
      {
        $match: {
          "items.vendor": vendorId,
          status: { $in: ["paid", "packed", "shipped", "delivered"] },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.vendor": vendorId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ventasTotales,
        totalOrdenes,
        ordenesPendientes: ordenesPendientes.length,
        totalProductos: vendorProducts.length,
        productosActivos: vendorProducts.filter((p) => p.isActive).length,
        lowStockProducts: lowStockProducts.map((p) => ({
          _id: p._id,
          name: p.name,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
        })),
        ventasPorMes,
      },
    });
  } catch (error) {
    console.error("Error en getVendorDashboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener órdenes que contienen productos del vendedor
// @route   GET /api/vendor/orders
const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { estado, page = 1, limit = 20 } = req.query;

    const filter = { "items.vendor": vendorId };
    if (estado) filter.status = estado;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "nombre email")
        .populate("items.product", "name images price")
        .populate("items.vendor", "nombre"),
      Order.countDocuments(filter),
    ]);

    // Filtrar items para que el vendedor solo vea sus propios productos
    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(
        (item) => item.vendor && item.vendor._id?.toString() === vendorId.toString()
      );
      return orderObj;
    });

    res.status(200).json({
      success: true,
      count: filteredOrders.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: filteredOrders,
    });
  } catch (error) {
    console.error("Error en getVendorOrders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Actualizar estado de un item del vendedor en una orden
// @route   PUT /api/vendor/orders/:orderId/items/:itemId/status
const updateVendorItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { estado, comentario } = req.body;
    const vendorId = req.user.id;

    const validEstados = ["packed", "shipped"];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Los válidos son: ${validEstados.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Orden no encontrada." });
    }

    // Verificar que el item pertenece al vendedor
    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Ítem no encontrado en la orden." });
    }

    if (!item.vendor || item.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: "No autorizado para este ítem." });
    }

    // Registrar en statusHistory
    order.statusHistory.push({
      estado: `item_${itemId}_${estado}`,
      usuarioQueCambio: req.user.id,
      fecha: new Date(),
      comentario: comentario || `Vendedor cambió estado del producto "${item.name}" a "${estado}"`,
    });

    // Si todos los items del vendedor están en shipped, se puede considerar actualizar el estado global
    await order.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "cambio_estado_orden",
      entidad: "orden",
      entidadId: order._id,
      detalles: `Vendedor actualizó producto "${item.name}" a "${estado}" en orden ${orderId}`,
      datosNuevos: { itemId, estado },
    });

    res.status(200).json({
      success: true,
      message: `Estado del producto actualizado a "${estado}"`,
      data: order,
    });
  } catch (error) {
    console.error("Error en updateVendorItemStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVendorDashboard,
  getVendorOrders,
  updateVendorItemStatus,
};
