const Ticket = require("../models/Ticket");
const RMA = require("../models/RMA");
const Order = require("../models/Order");
const { registrarAuditoria } = require("./adminController");

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
};
