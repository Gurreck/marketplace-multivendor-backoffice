const User = require("../models/User");
const generateToken = require("../config/generateToken");

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
const register = async (req, res) => {
  try {
    console.log('📝 Intentando registrar usuario...');
    console.log('Body recibido:', req.body);

    const { nombre, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    console.log('🔍 Buscando usuario existente con email:', email);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('❌ Usuario ya existe');
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario registrado con este email.",
      });
    }

    // Crear usuario con el rol seleccionado (por defecto: 'cliente')
    console.log('✅ Creando nuevo usuario...');
    const user = await User.create({ nombre, email, password, role: role || 'cliente' });
    console.log('✅ Usuario creado con ID:', user._id);

    // Generar token
    console.log('🔑 Generando token...');
    const token = generateToken(user);
    console.log('✅ Token generado exitosamente');

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
    console.error('❌❌❌ ERROR EN REGISTER ❌❌❌');
    console.error('Tipo de error:', error.name);
    console.error('Mensaje:', error.message);
    console.error('Stack completo:', error.stack);

    // Errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error en el servidor al registrar usuario.",
      error: error.message, // ⭐ Muestra el error en la respuesta
    });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Público
const login = async (req, res) => {
  try {
    console.log('🔐 Intentando login...');
    console.log('Email recibido:', req.body.email);

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
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor al iniciar sesión.",
      error: error.message,
    });
  }
};

module.exports = { register, login };