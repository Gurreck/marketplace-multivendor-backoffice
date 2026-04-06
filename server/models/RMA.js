const mongoose = require("mongoose");

const rmaItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const comentarioSchema = new mongoose.Schema(
  {
    texto: {
      type: String,
      required: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const rmaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    items: {
      type: [rmaItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Debe incluir al menos un producto a devolver",
      },
    },
    motivo: {
      type: String,
      required: [true, "El motivo de devolución es obligatorio"],
    },
    detalle: {
      type: String,
      default: "",
    },
    evidencia: {
      type: [String],
      default: [],
    },
    estado: {
      type: String,
      enum: ["requested", "approved", "rejected", "received", "refunded"],
      default: "requested",
    },
    comentarios: {
      type: [comentarioSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

rmaSchema.index({ user: 1 });
rmaSchema.index({ order: 1 });
rmaSchema.index({ estado: 1 });
rmaSchema.index({ createdAt: -1 });

module.exports = mongoose.model("RMA", rmaSchema);
