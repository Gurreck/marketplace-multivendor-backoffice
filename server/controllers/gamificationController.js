const Coupon = require("../models/Coupon");
const User = require("../models/User");
const { registrarAuditoria } = require("./adminController");

// Generar código único para cupón
const generateCouponCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "NEXO-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Girar la ruleta de primera compra
// @route   POST /api/gamification/spin
const spinWheel = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    // Verificar que completó su primera compra
    if (!user.firstPurchaseCompleted) {
      return res.status(400).json({
        success: false,
        message: "Debes completar tu primera compra para girar la ruleta.",
      });
    }

    // Verificar que no haya girado ya
    if (user.wheelSpun) {
      return res.status(400).json({
        success: false,
        message: "Ya has utilizado tu giro de la ruleta.",
      });
    }

    // Generar descuento aleatorio (5%, 10%, 15%, 20%, 25%)
    const descuentos = [5, 10, 10, 15, 15, 15, 20, 20, 25, 5];
    const descuento = descuentos[Math.floor(Math.random() * descuentos.length)];

    // Generar código único
    let codigo;
    let existe = true;
    while (existe) {
      codigo = generateCouponCode();
      existe = await Coupon.findOne({ codigo });
    }

    // Crear cupón — válido por 30 días
    const validoHasta = new Date();
    validoHasta.setDate(validoHasta.getDate() + 30);

    const coupon = await Coupon.create({
      codigo,
      descuentoPorcentaje: descuento,
      usuario: user._id,
      validoHasta,
      creadoPor: "Ruleta",
    });

    // Marcar que ya giró
    user.wheelSpun = true;
    await user.save();

    await registrarAuditoria({
      usuario: user._id,
      usuarioNombre: user.nombre,
      accion: "spin_ruleta",
      entidad: "cupon",
      entidadId: coupon._id,
      detalles: `Cupón ${codigo} generado con ${descuento}% de descuento para ${user.nombre}`,
      datosNuevos: { codigo, descuentoPorcentaje: descuento, validoHasta },
    });

    res.status(200).json({
      success: true,
      message: `¡Felicidades! Has ganado un ${descuento}% de descuento.`,
      data: {
        codigo,
        descuentoPorcentaje: descuento,
        validoHasta,
      },
    });
  } catch (error) {
    console.error("Error en spinWheel:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validar un código de cupón
// @route   GET /api/gamification/validate
const validateCoupon = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ success: false, message: "Código de cupón requerido." });
    }

    const coupon = await Coupon.findOne({ codigo: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Cupón no encontrado." });
    }

    if (coupon.usado) {
      return res.status(400).json({ success: false, message: "Este cupón ya fue utilizado." });
    }

    if (new Date() > new Date(coupon.validoHasta)) {
      return res.status(400).json({ success: false, message: "Este cupón ha expirado." });
    }

    // Verificar que el cupón pertenece al usuario si tiene usuario asignado
    if (coupon.usuario && coupon.usuario.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Este cupón no te pertenece." });
    }

    res.status(200).json({
      success: true,
      data: {
        codigo: coupon.codigo,
        descuentoPorcentaje: coupon.descuentoPorcentaje,
        validoHasta: coupon.validoHasta,
      },
    });
  } catch (error) {
    console.error("Error en validateCoupon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  spinWheel,
  validateCoupon,
};
