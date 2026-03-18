const User = require("../models/User");

// Guardar dirección de envío
exports.saveAddress = async (req, res) => {
  try {
    const { pais, provincia, ciudad, codigoPostal, direccion } = req.body;
    if (!pais || !provincia || !ciudad || !codigoPostal || !direccion) {
      return res.status(400).json({ success: false, message: "Todos los campos de dirección son obligatorios." });
    }
    // Actualizar usuario con dirección
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        shippingAddress: { pais, provincia, ciudad, codigoPostal, direccion }
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }
    res.status(200).json({ success: true, message: "Dirección guardada correctamente.", address: user.shippingAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al guardar dirección.", error: error.message });
  }
};
