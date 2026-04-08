const Ticket = require("../models/Ticket");
const RMA = require("../models/RMA");
const Order = require("../models/Order");
const { registrarAuditoria } = require("./adminController");

// ========== ÓRDENES (ENVÍOS) ==========

// @desc    Obtener todas las órdenes para gestionar envíos (Team Soporte)
// @route   GET /api/support/orders
const getSupportOrders = async (req, res) => {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const filter = {};
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

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: orders,
    });
  } catch (error) {
    console.error("Error al obtener órdenes de soporte:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Actualizar el estado de envío de una orden
// @route   PUT /api/support/orders/:orderId/status
const actualizarEstadoOrdenSoporte = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { estado, comentario } = req.body;

    if (!estado) {
      return res.status(400).json({ success: false, message: "El campo 'estado' es obligatorio." });
    }

    const estadosValidos = ["packed", "shipped", "delivered"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Válidos: ${estadosValidos.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Orden no encontrada." });
    }

    const flujoEstados = ["created", "pending", "paid", "packed", "shipped", "delivered"];
    const indiceActual = flujoEstados.indexOf(order.status);
    const indiceNuevo = flujoEstados.indexOf(estado);

    if (indiceNuevo <= indiceActual) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de "${order.status}" a "${estado}".`,
      });
    }

    const estadoAnterior = order.status;
    order.status = estado;

    order.statusHistory.push({
      estado,
      usuarioQueCambio: req.user.id,
      fecha: new Date(),
      comentario: comentario || `Soporte/Logística cambió estado a "${estado}"`,
    });

    await order.save();

    const orderActualizada = await Order.findById(order._id)
      .populate("user", "nombre email")
      .populate("items.product", "name images price")
      .populate("items.vendor", "nombre")
      .populate("statusHistory.usuarioQueCambio", "nombre");

    const io = req.app.get("io");
    io.to(order._id.toString()).emit("orderStatusUpdated", orderActualizada);

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "cambio_estado_orden_soporte",
      entidad: "orden",
      entidadId: order._id,
      detalles: `Soporte cambió estado de orden de "${estadoAnterior}" a "${estado}"`,
      datosAnteriores: { estado: estadoAnterior },
      datosNuevos: { estado },
    });

    res.status(200).json({
      success: true,
      message: `Estado de la orden actualizado a "${estado}"`,
      data: orderActualizada,
    });
  } catch (error) {
    console.error("Error en actualizarEstadoOrdenSoporte:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== TICKETS ==========

// @desc    Crear un ticket de soporte
// @route   POST /api/support/tickets
const createTicket = async (req, res) => {
  try {
    const { asunto, prioridad, descripcion, order } = req.body;

    if (!asunto) {
      return res.status(400).json({ success: false, message: "El asunto es obligatorio." });
    }

    const ticketData = {
      user: req.user.id,
      asunto,
      prioridad: prioridad || "Media",
      estado: "open",
    };

    if (order) ticketData.order = order;

    // Si hay un mensaje inicial
    if (descripcion) {
      ticketData.mensajes = [{
        remitente: req.user.id,
        texto: descripcion,
        fecha: new Date(),
      }];
    }

    const ticket = await Ticket.create(ticketData);

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "crear_ticket",
      entidad: "ticket",
      entidadId: ticket._id,
      detalles: `Ticket "${asunto}" creado por ${req.user.nombre}`,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error al crear ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Listar tickets (filtrado por rol)
// @route   GET /api/support/tickets
const getTickets = async (req, res) => {
  try {
    const { estado, prioridad, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Clientes solo ven sus propios tickets
    if (req.user.role === "cliente") {
      filter.user = req.user.id;
    }

    if (estado) filter.estado = estado;
    if (prioridad) filter.prioridad = prioridad;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "nombre email")
        .populate("asignadoA", "nombre email")
        .populate("escaladoA", "nombre email"),
      Ticket.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: tickets,
    });
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ver detalle de un ticket
// @route   GET /api/support/tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("user", "nombre email")
      .populate("asignadoA", "nombre email")
      .populate("escaladoA", "nombre email")
      .populate("mensajes.remitente", "nombre email role")
      .populate("order");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado." });
    }

    // Cliente solo puede ver sus propios tickets
    if (req.user.role === "cliente" && ticket.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "No autorizado." });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error al obtener ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Responder a un ticket (agregar mensaje)
// @route   POST /api/support/tickets/:id/reply
const replyTicket = async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ success: false, message: "El mensaje es obligatorio." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado." });
    }

    // Cliente solo puede responder en sus tickets
    if (req.user.role === "cliente" && ticket.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "No autorizado." });
    }

    ticket.mensajes.push({
      remitente: req.user.id,
      texto: mensaje,
      fecha: new Date(),
    });

    // Si soporte responde, cambiar estado a waiting_customer
    if (req.user.role === "soporte" || req.user.role === "administrador") {
      if (ticket.estado === "open" || ticket.estado === "in_progress") {
        ticket.estado = "waiting_customer";
      }
    }

    // Si cliente responde, cambiar a in_progress
    if (req.user.role === "cliente") {
      if (ticket.estado === "waiting_customer") {
        ticket.estado = "in_progress";
      }
    }

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("user", "nombre email")
      .populate("asignadoA", "nombre email")
      .populate("mensajes.remitente", "nombre email role");

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error("Error al responder ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cambiar estado de un ticket
// @route   PUT /api/support/tickets/:id/status
const updateTicketStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const validEstados = ["open", "in_progress", "waiting_customer", "resolved", "closed"];

    if (!validEstados.includes(estado)) {
      return res.status(400).json({ success: false, message: "Estado no válido." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado." });
    }

    const estadoAnterior = ticket.estado;
    ticket.estado = estado;
    await ticket.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "cambio_estado_ticket",
      entidad: "ticket",
      entidadId: ticket._id,
      detalles: `Estado de ticket cambiado de "${estadoAnterior}" a "${estado}"`,
      datosAnteriores: { estado: estadoAnterior },
      datosNuevos: { estado },
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error al cambiar estado del ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auto-asignarse un ticket (soporte)
// @route   PUT /api/support/tickets/:id/assign
const assignTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado." });
    }

    ticket.asignadoA = req.user.id;
    if (ticket.estado === "open") {
      ticket.estado = "in_progress";
    }
    await ticket.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "asignar_ticket",
      entidad: "ticket",
      entidadId: ticket._id,
      detalles: `Ticket asignado a ${req.user.nombre}`,
    });

    const populated = await Ticket.findById(ticket._id)
      .populate("user", "nombre email")
      .populate("asignadoA", "nombre email");

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error("Error al asignar ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Escalar ticket a Admin o Vendedor
// @route   PUT /api/support/tickets/:id/escalate
const escalateTicket = async (req, res) => {
  try {
    const { destino, comentario } = req.body;

    if (!destino) {
      return res.status(400).json({ success: false, message: "Debe indicar a quién escalar." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado." });
    }

    ticket.escaladoA = destino;
    if (comentario) {
      ticket.mensajes.push({
        remitente: req.user.id,
        texto: `[ESCALACIÓN] ${comentario}`,
        fecha: new Date(),
      });
    }
    await ticket.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "escalar_ticket",
      entidad: "ticket",
      entidadId: ticket._id,
      detalles: `Ticket escalado a usuario ${destino}. ${comentario || ""}`,
    });

    const populated = await Ticket.findById(ticket._id)
      .populate("user", "nombre email")
      .populate("asignadoA", "nombre email")
      .populate("escaladoA", "nombre email");

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error("Error al escalar ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== RMA (DEVOLUCIONES) ==========

// @desc    Solicitar devolución (RMA)
// @route   POST /api/support/rma
const createRMA = async (req, res) => {
  try {
    const { order, items, motivo, detalle, evidencia } = req.body;

    let itemsParsed = items;
    if (typeof items === 'string') {
      try {
        itemsParsed = JSON.parse(items);
      } catch (e) {
        itemsParsed = [];
      }
    }

    if (!order || !itemsParsed || itemsParsed.length === 0 || !motivo) {
      return res.status(400).json({
        success: false,
        message: "Orden, al menos un producto y motivo son obligatorios.",
      });
    }

    // Verificar que la orden pertenece al usuario
    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({ success: false, message: "Orden no encontrada." });
    }
    if (orderDoc.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "No autorizado." });
    }

    let uploadedEvidencia = [];
    if (req.files && req.files.length > 0) {
      uploadedEvidencia = req.files.map((f) => f.path);
    } else if (evidencia) {
      uploadedEvidencia = Array.isArray(evidencia) ? evidencia : [evidencia];
    }

    const rma = await RMA.create({
      user: req.user.id,
      order,
      items: itemsParsed,
      motivo,
      detalle: detalle || "",
      evidencia: uploadedEvidencia,
      estado: "requested",
    });

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "crear_rma",
      entidad: "rma",
      entidadId: rma._id,
      detalles: `RMA creado para orden ${order} - Motivo: ${motivo}`,
    });

    res.status(201).json({ success: true, data: rma });
  } catch (error) {
    console.error("Error al crear RMA:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener solicitudes RMA (filtro por rol)
// @route   GET /api/support/rma
const getRMAs = async (req, res) => {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === "cliente") {
      filter.user = req.user.id;
    }

    if (estado) filter.estado = estado;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rmas, total] = await Promise.all([
      RMA.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "nombre email")
        .populate("order")
        .populate("items.product", "name price images"),
      RMA.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: rmas.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: rmas,
    });
  } catch (error) {
    console.error("Error al obtener RMAs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cambiar estado de RMA (aprobar/rechazar/reembolsar)
// @route   PUT /api/support/rma/:id/status
const updateRMAStatus = async (req, res) => {
  try {
    const { estado, comentario } = req.body;
    const validEstados = ["requested", "approved", "rejected", "received", "refunded"];

    if (!validEstados.includes(estado)) {
      return res.status(400).json({ success: false, message: "Estado no válido." });
    }

    const rma = await RMA.findById(req.params.id);
    if (!rma) {
      return res.status(404).json({ success: false, message: "RMA no encontrado." });
    }

    const estadoAnterior = rma.estado;
    rma.estado = estado;

    if (comentario) {
      rma.comentarios.push({
        texto: comentario,
        usuario: req.user.id,
        fecha: new Date(),
      });
    }

    await rma.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "cambio_estado_rma",
      entidad: "rma",
      entidadId: rma._id,
      detalles: `Estado de RMA cambiado de "${estadoAnterior}" a "${estado}"`,
      datosAnteriores: { estado: estadoAnterior },
      datosNuevos: { estado },
    });

    res.status(200).json({ success: true, data: rma });
  } catch (error) {
    console.error("Error al actualizar RMA:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
  assignTicket,
  escalateTicket,
  createRMA,
  getRMAs,
  updateRMAStatus,
  getSupportOrders,
  actualizarEstadoOrdenSoporte,
};
