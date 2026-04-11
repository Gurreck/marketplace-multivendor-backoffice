require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const productRoutes = require("./routes/productRoutes");
const commentRoutes = require("./routes/commentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const supportRoutes = require("./routes/supportRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const addressRoutes = require("./routes/addressRoutes");
const { getCategories } = require("./controllers/categoryController");

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Parsear body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/gamification", gamificationRoutes);
app.get("/api/categories", getCategories);
app.use("/api", protectedRoutes);
app.use("/api/comments", commentRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Marketplace Multivendor - Servidor activo",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
    },
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada.",
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor.",
    error: err.message,
  });
});

module.exports = app;