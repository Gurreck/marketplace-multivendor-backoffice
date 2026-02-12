require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// 1. Headers de seguridad (Helmet va primero)
app.use(helmet());

// 2. Configuración CORS (Antes de procesar requests)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);

// 3. Body Parser (Necesario para que funcionen las sanitizaciones posteriores)
app.use(express.json({ limit: "10kb" }));

// Debug: Ver qué llega en el body
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Body:", req.body);
  next();
});

// 4. Sanitización y seguridad de datos
app.use(mongoSanitize()); // Prevenir inyección SQL/NoSQL
app.use(xss()); // Prevenir XSS (Cross-Site Scripting)
app.use(hpp()); // Prevenir contaminación de parámetros HTTP

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", protectedRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);

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
