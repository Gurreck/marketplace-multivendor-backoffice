const AuditLog = require("../models/AuditLog");

// @desc    Obtener registros de auditoría con filtros
// @route   GET /api/admin/audit
// @access  Solo Administrador
const getAuditLogs = async (req, res) => {
  try {
    const { usuario, accion, entidad, fechaDesde, fechaHasta, page = 1, limit = 20 } = req.query;

    // Construir filtros dinámicos
    const filter = {};

    if (usuario) {
      filter.usuario = usuario;
    }

    if (accion) {
      filter.accion = accion;
    }

    if (entidad) {
      filter.entidad = entidad;
    }

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      filter.createdAt = {};
      if (fechaDesde) {
        filter.createdAt.$gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = hasta;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("usuario", "nombre email"),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: logs,
    });
  } catch (error) {
    console.error("Error al obtener auditoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los registros de auditoría.",
    });
  }
};

// @desc    Obtener resumen de auditoría (para gráficos)
// @route   GET /api/admin/audit/summary
// @access  Solo Administrador
const getAuditSummary = async (req, res) => {
  try {
    // Acciones por tipo
    const accionesPorTipo = await AuditLog.aggregate([
      { $group: { _id: "$accion", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Acciones por entidad
    const accionesPorEntidad = await AuditLog.aggregate([
      { $group: { _id: "$entidad", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Acciones de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const accionesPorDia = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Usuarios más activos
    const usuariosMasActivos = await AuditLog.aggregate([
      { $group: { _id: "$usuario", nombre: { $first: "$usuarioNombre" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        accionesPorTipo,
        accionesPorEntidad,
        accionesPorDia,
        usuariosMasActivos,
      },
    });
  } catch (error) {
    console.error("Error al obtener resumen de auditoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el resumen de auditoría.",
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditSummary,
};
