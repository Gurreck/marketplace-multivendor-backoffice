const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "server", ".env") });

const Order = require(path.join(__dirname, "server", "models", "Order"));
const User = require(path.join(__dirname, "server", "models", "User"));
const Product = require(path.join(__dirname, "server", "models", "Product"));

async function checkOrders() {
  try {
    console.log("Intentando conectar a:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB");

    const orders = await Order.find().populate("user", "nombre email");
    console.log(`Total de órdenes encontradas: ${orders.length}`);

    orders.forEach((order, index) => {
      console.log(`\n--- Orden ${index + 1} ---`);
      console.log(`ID: ${order._id}`);
      console.log(`Usuario ID: ${order.user?._id || "SIN USUARIO"}`);
      console.log(`Usuario Nombre: ${order.user?.nombre || "N/A"}`);
      console.log(`Total: ${order.total}`);
      console.log(`Items: ${order.items.length}`);
      console.log(`Creada en: ${order.createdAt}`);
    });

    const users = await User.find({}, "nombre email role");
    console.log("\n--- Usuarios ---");
    users.forEach(u => console.log(`${u._id}: ${u.nombre} (${u.role})`));

    // Desconectar al terminar
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkOrders();
