const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  assignRole,
  toggleUserStatus,
  getVendors,
  approveVendor,
  suspendVendor,
  getKPIs,
} = require("../controllers/adminController");
const {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const {
  getAuditLogs,
  getAuditSummary,
} = require("../controllers/auditController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Todas las rutas requieren autenticación + rol administrador
router.use(authMiddleware);
router.use(authorize("administrador"));

// ========== USUARIOS ==========
// GET /api/admin/users - Obtener todos los usuarios
router.get("/users", getUsers);
// POST /api/admin/users - Crear un usuario
router.post("/users", createUser);
// PUT /api/admin/users/:id/role - Asignar rol a un usuario
router.put("/users/:id/role", assignRole);
// PUT /api/admin/users/:id/status - Activar/Desactivar usuario
router.put("/users/:id/status", toggleUserStatus);

// ========== VENDEDORES ==========
// GET /api/admin/vendors - Obtener vendedores con métricas
router.get("/vendors", getVendors);
// PUT /api/admin/vendors/:id/approve - Aprobar vendedor
router.put("/vendors/:id/approve", approveVendor);
// PUT /api/admin/vendors/:id/suspend - Suspender vendedor
router.put("/vendors/:id/suspend", suspendVendor);

// ========== CATEGORÍAS ==========
// GET /api/admin/categories - Obtener todas las categorías
router.get("/categories", getCategories);
// POST /api/admin/categories - Crear una categoría
router.post("/categories", createCategory);
// PUT /api/admin/categories/:id - Actualizar una categoría
router.put("/categories/:id", updateCategory);
// PUT /api/admin/categories/:id/toggle - Activar/Desactivar categoría
router.put("/categories/:id/toggle", toggleCategory);
// DELETE /api/admin/categories/:id - Eliminar una categoría
router.delete("/categories/:id", deleteCategory);

// ========== AUDITORÍA ==========
// GET /api/admin/audit - Obtener registros de auditoría
router.get("/audit", getAuditLogs);
// GET /api/admin/audit/summary - Resumen de auditoría
router.get("/audit/summary", getAuditSummary);

// ========== KPIs ==========
// GET /api/admin/kpis - Obtener métricas globales
router.get("/kpis", getKPIs);

module.exports = router;