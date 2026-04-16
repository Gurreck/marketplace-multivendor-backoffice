const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
    minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
    select: false,
  },
  aceptoTerminos: {
    type: Boolean,
    default: false,
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
  resetPasswordToken: {
    type: String,
    default: undefined,
  },
  resetPasswordExpire: {
    type: Date,
    default: undefined,
  },
}, {
  timestamps: true,
});

// Hash password antes de guardar
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);