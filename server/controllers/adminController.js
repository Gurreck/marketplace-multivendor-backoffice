const User = require("../models/User");
const Product = require("../models/Product");
const AuditLog = require("../models/AuditLog");

// ========== UTILIDAD: Registrar acción en auditoría ==========
const registrarAuditoria = async ({ usuario, usuarioNombre, accion, entidad, entidadId, detalles, datosAnteriores, datosNuevos }) => {
  try {
    await AuditLog.create({
      usuario,
      usuarioNombre,
      accion,
      entidad,
      entidadId,
      detalles,
      datosAnteriores,
      datosNuevos,
    });
  } catch (err) {
    console.error("Error al registrar auditoría:", err);
  }
};

// ========== GESTIÓN DE USUARIOS ==========

// @desc    Obtener todos los usuarios
// @route   GET /api/admin/users
// @access  Solo Administrador
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios.",
    });
  }
};

// @desc    Crear un nuevo usuario
// @route   POST /api/admin/users
// @access  Solo Administrador
const createUser = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y contraseña son obligatorios.",
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese email.",
      });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre,
      email,
      password: hashedPassword,
      role: role || "cliente",
    });

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "crear_usuario",
      entidad: "usuario",
      entidadId: user._id,
      detalles: `Usuario "${nombre}" creado con rol "${user.role}"`,
      datosNuevos: { nombre, email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente.",
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear el usuario.",
    });
  }
};

// @desc    Asignar rol a un usuario
// @route   PUT /api/admin/users/:id/role
// @access  Solo Administrador
const assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un rol.",
      });
    }

    const validRoles = ["cliente", "vendedor", "administrador"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Rol no válido. Los roles disponibles son: ${validRoles.join(", ")}.`,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    const rolAnterior = user.role;
    user.role = role;
    await user.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "asignar_rol",
      entidad: "usuario",
      entidadId: user._id,
      detalles: `Rol cambiado de "${rolAnterior}" a "${role}" para "${user.nombre}"`,
      datosAnteriores: { role: rolAnterior },
      datosNuevos: { role },
    });

    res.status(200).json({
      success: true,
      message: `Rol actualizado exitosamente a '${role}'.`,
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de usuario no válido.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al asignar el rol.",
    });
  }
};

// @desc    Desactivar/Activar usuario
// @route   PUT /api/admin/users/:id/status
// @access  Solo Administrador
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    const estadoAnterior = user.activo;
    user.activo = activo;
    await user.save();

    const accion = activo ? "activar_usuario" : "desactivar_usuario";

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion,
      entidad: "usuario",
      entidadId: user._id,
      detalles: `Usuario "${user.nombre}" ${activo ? "activado" : "desactivado"}`,
      datosAnteriores: { activo: estadoAnterior },
      datosNuevos: { activo },
    });

    res.status(200).json({
      success: true,
      message: `Usuario ${activo ? "activado" : "desactivado"} exitosamente.`,
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        activo: user.activo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al cambiar el estado del usuario.",
    });
  }
};

// ========== GESTIÓN DE VENDEDORES ==========

// @desc    Obtener todos los vendedores con métricas
// @route   GET /api/admin/vendors
// @access  Solo Administrador
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendedor" }).select("-__v");

    // Obtener métricas por vendedor
    const vendorsWithMetrics = await Promise.all(
      vendors.map(async (vendor) => {
        const productCount = await Product.countDocuments({ vendor: vendor._id });
        const products = await Product.find({ vendor: vendor._id });
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const avgPrice = products.length > 0
          ? products.reduce((sum, p) => sum + p.price, 0) / products.length
          : 0;

        return {
          _id: vendor._id,
          nombre: vendor.nombre,
          email: vendor.email,
          role: vendor.role,
          activo: vendor.activo,
          createdAt: vendor.createdAt,
          metricas: {
            totalProductos: productCount,
            totalStock,
            precioPromedio: Math.round(avgPrice),
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: vendorsWithMetrics.length,
      data: vendorsWithMetrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los vendedores.",
    });
  }
};

// @desc    Aprobar vendedor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Solo Administrador
const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendedor no encontrado.",
      });
    }

    user.activo = true;
    user.role = "vendedor";
    await user.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "aprobar_vendedor",
      entidad: "vendedor",
      entidadId: user._id,
      detalles: `Vendedor "${user.nombre}" aprobado`,
      datosNuevos: { activo: true, role: "vendedor" },
    });

    res.status(200).json({
      success: true,
      message: "Vendedor aprobado exitosamente.",
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        activo: user.activo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al aprobar el vendedor.",
    });
  }
};

// @desc    Suspender vendedor
// @route   PUT /api/admin/vendors/:id/suspend
// @access  Solo Administrador
const suspendVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendedor no encontrado.",
      });
    }

    user.activo = false;
    await user.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "suspender_vendedor",
      entidad: "vendedor",
      entidadId: user._id,
      detalles: `Vendedor "${user.nombre}" suspendido`,
      datosAnteriores: { activo: true },
      datosNuevos: { activo: false },
    });

    res.status(200).json({
      success: true,
      message: "Vendedor suspendido exitosamente.",
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        activo: user.activo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al suspender el vendedor.",
    });
  }
};

// ========== REPORTERÍA / KPIs ==========

// @desc    Obtener KPIs globales del dashboard
// @route   GET /api/admin/kpis
// @access  Solo Administrador
const getKPIs = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: "vendedor" });
    const totalClients = await User.countDocuments({ role: "cliente" });
    const totalProducts = await Product.countDocuments();

    // Productos por categoría
    const productsByCategory = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top productos por stock
    const topProducts = await Product.find()
      .sort({ stock: -1 })
      .limit(10)
      .populate("vendor", "nombre")
      .select("name price stock category vendor");

    // Top vendedores por cantidad de productos
    const topVendors = await Product.aggregate([
      { $group: { _id: "$vendor", totalProductos: { $sum: 1 }, totalStock: { $sum: "$stock" } } },
      { $sort: { totalProductos: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendorInfo",
        },
      },
      { $unwind: "$vendorInfo" },
      {
        $project: {
          _id: 1,
          totalProductos: 1,
          totalStock: 1,
          nombre: "$vendorInfo.nombre",
          email: "$vendorInfo.email",
        },
      },
    ]);

    // Productos creados por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const productsByMonth = await Product.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        resumen: {
          totalUsuarios: totalUsers,
          totalVendedores: totalVendors,
          totalClientes: totalClients,
          totalProductos: totalProducts,
        },
        productosPorCategoria: productsByCategory,
        topProductos: topProducts,
        topVendedores: topVendors,
        productosPorMes: productsByMonth,
      },
    });
  } catch (error) {
    console.error("Error al obtener KPIs:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los KPIs.",
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  assignRole,
  toggleUserStatus,
  getVendors,
  approveVendor,
  suspendVendor,
  getKPIs,
  registrarAuditoria,
};