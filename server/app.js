require("dotenv").config();

// 🔍 DEBUG: Ver variables de entorno
console.log('===================== DEBUG .ENV =====================');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET existe?:', !!process.env.JWT_SECRET);
console.log('====================================================');

// ... resto del código
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const helmet = require("helmet");

// ⚠️ COMENTADOS - Incompatibles con Node.js v24
// const xss = require("xss-clean");
// const hpp = require("hpp");

// 1️⃣ PRIMERO: CORS (antes de cualquier cosa)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// 2️⃣ SEGUNDO: Parsear el body (ANTES de sanitizar)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// 3️⃣ TERCERO: Middleware de seguridad
app.use(helmet()); // Headers de seguridad HTTP
// app.use(xss()); // ⚠️ DESACTIVADO - Incompatible con Node.js v24
// app.use(hpp()); // ⚠️ DESACTIVADO - Incompatible con Node.js v24

// 4️⃣ CUARTO: Rutas
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
  console.error('==================== ERROR ====================');
  console.error('Ruta:', req.method, req.path);
  console.error('Error completo:', err);
  console.error('Stack:', err.stack);
  console.error('===============================================');
  
  res.status(500).json({
    success: false,
    message: "Error interno del servidor.",
    error: err.message,
  });
});

// Conectar a MongoDB y levantar servidor
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});