const Category = require("../models/Category");
const { registrarAuditoria } = require("./adminController");

// @desc    Obtener todas las categorías
// @route   GET /api/admin/categories
// @access  Solo Administrador
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las categorías.",
    });
  }
};

// @desc    Crear una categoría
// @route   POST /api/admin/categories
// @access  Solo Administrador
const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la categoría es obligatorio.",
      });
    }

    // Verificar duplicado
    const existing = await Category.findOne({ nombre });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una categoría con ese nombre.",
      });
    }

    const category = await Category.create({
      nombre,
      descripcion: descripcion || "",
    });

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "crear_categoria",
      entidad: "categoria",
      entidadId: category._id,
      detalles: `Categoría "${nombre}" creada`,
      datosNuevos: { nombre, descripcion },
    });

    res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear la categoría.",
    });
  }
};

// @desc    Actualizar una categoría
// @route   PUT /api/admin/categories/:id
// @access  Solo Administrador
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada.",
      });
    }

    const datosAnteriores = {
      nombre: category.nombre,
      descripcion: category.descripcion,
    };

    if (nombre) category.nombre = nombre;
    if (descripcion !== undefined) category.descripcion = descripcion;

    await category.save();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "editar_categoria",
      entidad: "categoria",
      entidadId: category._id,
      detalles: `Categoría "${category.nombre}" editada`,
      datosAnteriores,
      datosNuevos: { nombre: category.nombre, descripcion: category.descripcion },
    });

    res.status(200).json({
      success: true,
      message: "Categoría actualizada exitosamente.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la categoría.",
    });
  }
};

// @desc    Activar/Desactivar categoría
// @route   PUT /api/admin/categories/:id/toggle
// @access  Solo Administrador
const toggleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada.",
      });
    }

    const estadoAnterior = category.activa;
    category.activa = !category.activa;
    await category.save();

    const accion = category.activa ? "activar_categoria" : "desactivar_categoria";

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion,
      entidad: "categoria",
      entidadId: category._id,
      detalles: `Categoría "${category.nombre}" ${category.activa ? "activada" : "desactivada"}`,
      datosAnteriores: { activa: estadoAnterior },
      datosNuevos: { activa: category.activa },
    });

    res.status(200).json({
      success: true,
      message: `Categoría ${category.activa ? "activada" : "desactivada"} exitosamente.`,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al cambiar el estado de la categoría.",
    });
  }
};

// @desc    Eliminar una categoría
// @route   DELETE /api/admin/categories/:id
// @access  Solo Administrador
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada.",
      });
    }

    const nombreCategoria = category.nombre;
    await category.deleteOne();

    await registrarAuditoria({
      usuario: req.user.id,
      usuarioNombre: req.user.nombre,
      accion: "eliminar_categoria",
      entidad: "categoria",
      entidadId: id,
      detalles: `Categoría "${nombreCategoria}" eliminada`,
      datosAnteriores: { nombre: nombreCategoria },
    });

    res.status(200).json({
      success: true,
      message: "Categoría eliminada exitosamente.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar la categoría.",
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
};
