const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    images: {
      type: [String], // URLs de imágenes
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Debe incluir al menos una imagen (URL)",
      },
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
