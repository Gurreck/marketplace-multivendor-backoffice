require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", protectedRoutes);
app.use("/api/products", productRoutes);

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
      admin: {
        getUsers: "GET /api/admin/users",
        assignRole: "PUT /api/admin/users/:id/role",
      },
      dashboards: {
        cliente: "GET /api/cliente/dashboard",
        vendedor: "GET /api/vendedor/dashboard",
        admin: "GET /api/admin/dashboard",
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
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor.",
  });
});

// Conectar a MongoDB y levantar servidor
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
