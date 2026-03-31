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
        debitCard: user.debitCard,
        shippingAddress: user.shippingAddress,
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
        debitCard: user.debitCard,
        shippingAddress: user.shippingAddress,
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

// @desc    Actualizar perfil
// @route   PUT /api/auth/profile
// @access  Privado
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    user.nombre = req.body.nombre || user.nombre;

    if (req.body.password) {
      user.password = req.body.password;
      // El hook pre('save') en el modelo User hasheará automáticamente
    }

    if (req.body.debitCard) {
      user.debitCard = req.body.debitCard;
    }

    if (req.body.shippingAddress) {
      user.shippingAddress = req.body.shippingAddress;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Perfil actualizado exitosamente.",
      data: {
        id: updatedUser._id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        role: updatedUser.role,
        debitCard: updatedUser.debitCard,
        shippingAddress: updatedUser.shippingAddress,
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el perfil.",
      error: error.message,
    });
  }
};

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/profile
// @access  Privado
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        shippingAddress: user.shippingAddress,
        debitCard: user.debitCard,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el perfil.",
      error: error.message,
    });
  }
};

module.exports = { register, login, updateProfile, getProfile };