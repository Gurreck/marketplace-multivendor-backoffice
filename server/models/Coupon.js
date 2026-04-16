const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código del cupón es obligatorio"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    descuentoPorcentaje: {
      type: Number,
      required: [true, "El porcentaje de descuento es obligatorio"],
      min: [1, "El descuento mínimo es 1%"],
      max: [100, "El descuento máximo es 100%"],
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    validoHasta: {
      type: Date,
      required: true,
    },
    usado: {
      type: Boolean,
      default: false,
    },
    ordenUsado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    creadoPor: {
      type: String,
      enum: ["Ruleta", "Admin"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ codigo: 1 });
couponSchema.index({ usuario: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
