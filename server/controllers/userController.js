const User = require("../models/User");

// @desc    Obtener perfil del usuario actual
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.nombre = req.body.nombre || user.nombre;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        // El modelo tiene un middleware .pre('save') para hashear si cambió
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          nombre: updatedUser.nombre,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
