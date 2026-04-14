require("dotenv").config();

// 🔍 DEBUG: Ver variables de entorno
console.log('===================== DEBUG .ENV =====================');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET existe?:', !!process.env.JWT_SECRET);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('====================================================');

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

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

// 1️⃣ CORS
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

// 2️⃣ Parsear body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// 3️⃣ Seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 4️⃣ Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5️⃣ Rutas
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

// ✅ Crear servidor HTTP a partir de app
const server = http.createServer(app);

// ✅ Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
  });
  socket.on("leaveOrderRoom", (orderId) => {
    socket.leave(orderId);
  });
  socket.on("joinUserRoom", (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on("leaveUserRoom", (userId) => {
    socket.leave(`user_${userId}`);
  });
  socket.on("joinRoleRoom", (role) => {
    socket.join(`role_${role}`);
  });
  socket.on("leaveRoleRoom", (role) => {
    socket.leave(`role_${role}`);
  });
  socket.on("disconnect", () => {

  });
});

// ✅ Guardar io para usarlo en controllers
app.set("io", io);

// ✅ Conectar a MongoDB y levantar servidor UNA sola vez
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
});