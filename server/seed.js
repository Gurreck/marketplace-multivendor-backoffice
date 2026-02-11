require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB conectado para seed...");

    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ role: "administrador" });

    if (existingAdmin) {
      console.log("Ya existe un usuario administrador:");
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Nombre: ${existingAdmin.nombre}`);
      process.exit(0);
    }

    // Crear usuario administrador
    const admin = await User.create({
      nombre: "Administrador",
      email: "admin@marketplace.com",
      password: "admin123",
      role: "administrador",
    });

    console.log("Usuario administrador creado exitosamente:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: admin123`);
    console.log(`  Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error("Error al crear admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
