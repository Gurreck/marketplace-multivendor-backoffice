const User = require("../models/User");
const generateToken = require("../config/generateToken");
const crypto = require("crypto");
const sendEmail = require("../Utils/SendEmail");

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
const register = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario registrado con este email.",
      });
    }

    const user = await User.create({
      nombre,
      email,
      password,
      role: role || "cliente",
    });

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
        debitCard: user.debitCard,
        shippingAddress: user.shippingAddress,
        telefono: user.telefono,
        profilePicture: user.profilePicture,
        firstPurchaseCompleted: user.firstPurchaseCompleted,
        wheelSpun: user.wheelSpun,
        storeDescription: user.storeDescription,
        storeBanner: user.storeBanner,
      },
    });
  } catch (error) {
    console.error("❌ ERROR EN REGISTER:", error);

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
      error: error.message,
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

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas.",
      });
    }

    // Check if user is active
    if (user.activo === false) {
      return res.status(403).json({
        success: false,
        message: "Tu cuenta ha sido bloqueada. Por favor, contacta a soporte.",
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
        telefono: user.telefono,
        profilePicture: user.profilePicture,
        firstPurchaseCompleted: user.firstPurchaseCompleted,
        wheelSpun: user.wheelSpun,
        storeDescription: user.storeDescription,
        storeBanner: user.storeBanner,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
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
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    user.nombre = req.body.nombre || user.nombre;

    if (req.body.debitCard) {
      user.debitCard = req.body.debitCard;
    }

    if (req.body.telefono !== undefined) {
      user.telefono = req.body.telefono;
    }

    if (req.body.shippingAddress) {
      user.shippingAddress = req.body.shippingAddress;
    }

    if (req.body.profilePicture !== undefined) {
      user.profilePicture = req.body.profilePicture;
    }

    if (req.body.storeDescription !== undefined) {
      user.storeDescription = req.body.storeDescription;
    }

    if (req.body.storeBanner !== undefined) {
      user.storeBanner = req.body.storeBanner;
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
        telefono: updatedUser.telefono,
        profilePicture: updatedUser.profilePicture,
        storeDescription: updatedUser.storeDescription,
        storeBanner: updatedUser.storeBanner,
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
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
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
        telefono: user.telefono,
        profilePicture: user.profilePicture,
        firstPurchaseCompleted: user.firstPurchaseCompleted,
        wheelSpun: user.wheelSpun,
        storeDescription: user.storeDescription,
        storeBanner: user.storeBanner,
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

// @desc    Subir foto de perfil
// @route   PUT /api/auth/profile/picture
// @access  Privado
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se subió ninguna imagen.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    user.profilePicture = req.file.path;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Foto de perfil actualizada exitosamente.",
      data: {
        id: updatedUser._id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        role: updatedUser.role,
        debitCard: updatedUser.debitCard,
        shippingAddress: updatedUser.shippingAddress,
        telefono: updatedUser.telefono,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("❌ Error al subir foto de perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al subir la foto de perfil.",
      error: error.message,
    });
  }
};

// @desc    Solicitar recuperación de contraseña
// @route   POST /api/auth/forgot-password
// @access  Público
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 Email recibido:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El email es obligatorio.",
      });
    }

    const user = await User.findOne({ email });
    console.log("👤 Usuario encontrado:", user ? user.email : "NO");

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Si el correo existe, se enviará un enlace de recuperación.",
      });
    }

    const resetToken = user.getResetPasswordToken();
    console.log("🔑 Token generado:", resetToken);

    await user.save({ validateBeforeSave: false });
    console.log("💾 Token guardado en BD");

    const resetUrl = `${process.env.CLIENT_URL}/ReseteoPassword/${resetToken}`;
    console.log("🔗 Reset URL:", resetUrl);

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${user.nombre},</p>
        <p>Haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      </div>
    `;

    console.log("📨 Intentando enviar correo...");
    await sendEmail({
      email: user.email,
      subject: "Recuperación de contraseña",
      html,
    });
    console.log("✅ Correo enviado");

    res.status(200).json({
      success: true,
      message: "Si el correo existe, se enviará un enlace de recuperación.",
    });
  } catch (error) {
    console.error("❌ Error en forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud.",
      error: error.message,
    });
  }
};

// @desc    Restablecer contraseña con token
// @route   POST /api/auth/reset-password/:token
// @access  Público
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Debes completar ambos campos de contraseña.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "El enlace es inválido o expiró.",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    console.error("❌ Error en resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error al restablecer la contraseña.",
      error: error.message,
    });
  }
};

// @desc    Cambiar contraseña del usuario logueado
// @route   PUT /api/auth/change-password
// @access  Privado
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las nuevas contraseñas no coinciden.",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "La contraseña actual es incorrecta.",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Contraseña cambiada correctamente.",
    });
  } catch (error) {
    console.error("❌ Error en changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar la contraseña.",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  getProfile,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
  changePassword,
};