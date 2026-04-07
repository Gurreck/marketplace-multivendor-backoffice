const mongoose = require("mongoose");

const mensajeSchema = new mongoose.Schema(
  {
    remitente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    texto: {
      type: String,
      required: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    asunto: {
      type: String,
      required: [true, "El asunto del ticket es obligatorio"],
      trim: true,
    },
    prioridad: {
      type: String,
      enum: ["Baja", "Media", "Alta"],
      default: "Media",
    },
    estado: {
      type: String,
      enum: ["open", "in_progress", "waiting_customer", "resolved", "closed"],
      default: "open",
    },
    mensajes: {
      type: [mensajeSchema],
      default: [],
    },
    asignadoA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    escaladoA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ user: 1 });
ticketSchema.index({ estado: 1 });
ticketSchema.index({ asignadoA: 1 });
ticketSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Ticket", ticketSchema);
