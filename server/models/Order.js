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
  },
  { _id: false }
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
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
