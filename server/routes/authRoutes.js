const express = require("express");
const router = express.Router();

const {
  register,
  login,
  updateProfile,
  getProfile,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// DEBUG (opcional)
console.log("REGISTER:", register);
console.log("LOGIN:", login);

// =====================
// AUTH
// =====================

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// =====================
// PROFILE
// =====================

// PUT /api/auth/profile
router.put("/profile", authMiddleware, updateProfile);

// GET /api/auth/profile
router.get("/profile", authMiddleware, getProfile);

// PUT /api/auth/profile/picture
router.put(
  "/profile/picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// =====================
// PASSWORD
// =====================

// 🔑 Olvidé contraseña
// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// 🔑 Reset con token
// POST /api/auth/ReseteoPassword/:token
router.post("/ReseteoPassword/:token", resetPassword);

// 🔑 Cambiar contraseña (logueado)
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;