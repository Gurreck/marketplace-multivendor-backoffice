const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Formato de email inválido"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    select: false,
  },
  role: {
    type: String,
    enum: {
      values: ["cliente", "vendedor", "administrador"],
      message: "Rol no válido. Debe ser: cliente, vendedor o administrador",
    },
    default: "cliente",
  },
  shippingAddress: {
    pais: { type: String },
    provincia: { type: String },
    ciudad: { type: String },
    codigoPostal: { type: String },
    direccion: { type: String }
  },
  activo: {
    type: Boolean,
    default: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);