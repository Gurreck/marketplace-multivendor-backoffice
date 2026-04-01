const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const {
  createTicket,
  getTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
  assignTicket,
  escalateTicket,
  createRMA,
  getRMAs,
  updateRMAStatus,
} = require("../controllers/supportController");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ========== TICKETS ==========
// POST /api/support/tickets — Cliente crea ticket
router.post("/tickets", createTicket);
// GET /api/support/tickets — Listar tickets (filtrado por rol)
router.get("/tickets", getTickets);
// GET /api/support/tickets/:id — Ver detalle del ticket
router.get("/tickets/:id", getTicketById);
// POST /api/support/tickets/:id/reply — Agregar mensaje
router.post("/tickets/:id/reply", replyTicket);
// PUT /api/support/tickets/:id/status — Cambiar estado (soporte/admin)
router.put("/tickets/:id/status", authorize("soporte", "administrador"), updateTicketStatus);
// PUT /api/support/tickets/:id/assign — Soporte se auto-asigna
router.put("/tickets/:id/assign", authorize("soporte", "administrador"), assignTicket);
// PUT /api/support/tickets/:id/escalate — Escalar a Admin/Vendedor
router.put("/tickets/:id/escalate", authorize("soporte", "administrador"), escalateTicket);

// ========== RMA (DEVOLUCIONES) ==========
// POST /api/support/rma — Cliente solicita devolución
router.post("/rma", upload.array("evidencia", 5), createRMA);
// GET /api/support/rma — Listar devoluciones (filtrado por rol)
router.get("/rma", getRMAs);
// PUT /api/support/rma/:id/status — Aprobar/Rechazar/Reembolsar
router.put("/rma/:id/status", authorize("soporte", "administrador"), updateRMAStatus);

module.exports = router;
