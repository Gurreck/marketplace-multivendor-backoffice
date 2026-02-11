const User = require("../models/User");

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

// @desc    Asignar rol a un usuario
// @route   PUT /api/admin/users/:id/role
// @access  Solo Administrador
const assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // Validar que se proporcionó un rol
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un rol.",
      });
    }

    // Validar que el rol sea válido
    const validRoles = ["cliente", "vendedor", "administrador"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Rol no válido. Los roles disponibles son: ${validRoles.join(", ")}.`,
      });
    }

    // Buscar y actualizar el usuario
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

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

module.exports = { getUsers, assignRole };
