const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "El pedido debe tener al menos un producto",
    },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    pais: String,
    provincia: String,
    ciudad: String,
    codigoPostal: String,
    direccion: String,
  },
  paymentMethod: {
    type: String,
    default: "card",
  },
  paymentDetails: {
    lastFourDigits: String,
    cardType: String,
  },
  status: {
    type: String,
    enum: ["pendiente", "pagado", "enviado", "entregado", "cancelado"],
    default: "pagado",
  },
}, {
  timestamps: true,
});

// Índice para buscar pedidos por usuario y por producto
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.product": 1 });

module.exports = mongoose.model("Order", orderSchema);
