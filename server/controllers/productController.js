const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const { registrarAuditoria } = require("./adminController");

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      brand: req.body.brand,
      stock: req.body.stock,
      images,
      vendor: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error("Error en createProduct:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener todos los productos (con filtros avanzados)
const getProducts = async (req, res) => {
  try {
    let query = {};

    // Solo productos activos por defecto (soft delete)
    if (req.query.vendor === "me" && req.user) {
      query.vendor = req.user.id;
      // Vendedor ve todos sus productos, incluso inactivos
    } else {
      query.isActive = { $ne: false };
    }

    // Búsqueda por texto (nombre o descripción)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    // Filtro por categoría
    if (req.query.category && req.query.category !== "Todos") {
      query.category = req.query.category;
    }

    // Filtro por rango de precio
    if (req.query.priceMin || req.query.priceMax) {
      query.price = {};
      if (req.query.priceMin) query.price.$gte = parseFloat(req.query.priceMin);
      if (req.query.priceMax) query.price.$lte = parseFloat(req.query.priceMax);
    }

    // Filtro por vendedor
    if (req.query.vendor && req.query.vendor !== "me") {
      query.vendor = req.query.vendor;
    }

    // Filtro por disponibilidad (stock > 0)
    if (req.query.inStock === "true") {
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query).populate(
      "vendor",
      "nombre email"
    );

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error en getProducts:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener productos del vendedor autenticado
const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id }).populate(
      "vendor",
      "nombre email"
    );

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error en getVendorProducts:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "nombre email"
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
    console.error("Error en getProductById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Actualizar producto
const updateProduct = async (req, res) => {
  try {

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    if (!product.vendor.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    let images = [...product.images];

    // eliminar imágenes seleccionadas
    if (req.body.removeImages) {
      const removeImages = JSON.parse(req.body.removeImages);

      for (const img of removeImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      images = images.filter(
        (img) => !removeImages.some((r) => r.public_id === img.public_id)
      );
    }

    // agregar nuevas imágenes
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      images = [...images, ...newImages];
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Eliminar producto (SOFT DELETE)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    if (
      !product.vendor.equals(req.user.id) &&
      req.user.role !== "administrador"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    // ⭐ SOFT DELETE: marcar como inactivo en vez de borrar
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "eliminar_producto",
      entidad: "producto",
      entidadId: product._id,
      detalles: `Producto "${product.name}" desactivado (soft delete)`,
      datosAnteriores: { isActive: true },
      datosNuevos: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: "Producto desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle isActive de un producto
// @route   PUT /api/products/:id/toggle
const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    if (!product.vendor.equals(req.user.id) && req.user.role !== "administrador") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Producto ${product.isActive ? "activado" : "pausado"}`,
      data: product,
    });
  } catch (error) {
    console.error("Error en toggleProduct:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getVendorProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProduct,
};