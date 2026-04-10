const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    pais: { type: String, required: true },
    provincia: { type: String, required: true },
    ciudad: { type: String, required: true },
    codigoPostal: { type: String, required: true },
    direccion: { type: String, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    estado: { type: String, required: true },
    usuarioQueCambio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fecha: { type: Date, default: Date.now },
    comentario: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "La orden debe tener al menos un producto",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    paymentMethod: {
      brand: { type: String, default: "Tarjeta" },
      last4: { type: String, default: "****" }
    },

    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "paid",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "created",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidAt: { type: Date },

    // FACTURA
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    invoiceSent: {
      type: Boolean,
      default: false,
    },
    invoiceSentAt: {
      type: Date,
    },
    invoicePdfUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "items.vendor": 1 });
orderSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model("Order", orderSchema);