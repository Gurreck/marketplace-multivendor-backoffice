const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usuarioNombre: {
      type: String,
      required: true,
    },
    accion: {
      type: String,
      required: [true, "La acción es obligatoria"],
      enum: [
        "crear_usuario",
        "desactivar_usuario",
        "activar_usuario",
        "asignar_rol",
        "aprobar_vendedor",
        "suspender_vendedor",
        "crear_categoria",
        "editar_categoria",
        "activar_categoria",
        "desactivar_categoria",
        "eliminar_categoria",
        "cambio_estado",
        "aprobacion",
        "uso_cupon",
        "crear_producto",
        "eliminar_producto",
        "otro",
      ],
    },
    entidad: {
      type: String,
      required: true,
      enum: ["usuario", "vendedor", "categoria", "producto", "orden", "cupon", "otro"],
    },
    entidadId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    detalles: {
      type: String,
      default: "",
    },
    // Datos anteriores y nuevos para trazabilidad
    datosAnteriores: {
      type: mongoose.Schema.Types.Mixed,
    },
    datosNuevos: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para filtrado eficiente
auditLogSchema.index({ usuario: 1 });
auditLogSchema.index({ accion: 1 });
auditLogSchema.index({ entidad: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
