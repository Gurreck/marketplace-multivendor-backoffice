const Product = require("../models/Product");

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private (Vendedor, Admin)
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      vendor: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public / Private (Filtra según rol)
const getProducts = async (req, res) => {
  try {
    let query = {};

    // Solo filtrar por vendor si el usuario está autenticado Y lo solicita
    if (req.query.vendor === "me" && req.user) {
      query.vendor = req.user.id;
    }

    const products = await Product.find(query).populate(
      "vendor",
      "nombre email",
    );

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error en getProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "nombre email",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error en getProductById:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private (Vendor dueño del producto o Admin)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Verificar propiedad
    if (
      product.vendor.toString() !== req.user.id &&
      req.user.role !== "administrador"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para editar este producto",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error en updateProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private (Vendor dueño del producto o Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Verificar propiedad
    if (
      product.vendor.toString() !== req.user.id &&
      req.user.role !== "administrador"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para eliminar este producto",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Producto eliminado",
    });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ⭐ EXPORTAR TODO AL FINAL
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};