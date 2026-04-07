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
      values: ["cliente", "vendedor", "administrador", "soporte"],
      message: "Rol no válido. Debe ser: cliente, vendedor, administrador o soporte",
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
  debitCard: {
    cardNumber: { type: String },
    cardName: { type: String },
    expiryDate: { type: String },
    cvv: { type: String }
  },
  activo: {
    type: Boolean,
    default: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  firstPurchaseCompleted: {
    type: Boolean,
    default: false,
  },
  wheelSpun: {
    type: Boolean,
    default: false,
  },
  telefono: {
    type: String,
    trim: true,
  },
  storeDescription: {
    type: String,
    trim: true,
    default: "",
  },
  storeBanner: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

// Hash password antes de guardar
userSchema.pre("save", async function () {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);