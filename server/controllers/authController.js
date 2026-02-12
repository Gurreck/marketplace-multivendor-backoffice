const User = require("../models/User");
const generateToken = require("../config/generateToken");

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
const register = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario registrado con este email.",
      });
    }

    // Crear usuario
    const user = await User.create({ nombre, email, password, role });

    // Generar token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente.",
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    // Errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    console.error("Error en register:", error); // Log para consola
    res.status(500).json({
      success: false,
      message: "Error interno: " + error.message, // Mostrar error al usuario (dev mode)
    });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Público
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios.",
      });
    }

    // Buscar usuario e incluir password (excluido por defecto)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas.",
      });
    }

    // Comparar contraseñas
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas.",
      });
    }

    // Generar token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el servidor al iniciar sesión.",
    });
  }
};

module.exports = { register, login };
