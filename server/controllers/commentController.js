const Comment = require("../models/Comment");
const Product = require("../models/Product");

// @desc    Crear un comentario
// @route   POST /api/comments
// @access  Private (solo clientes)
const createComment = async (req, res) => {
  try {
    const { productId, rating, text } = req.body;

    // Verificar si el usuario ya dejó una reseña para este producto
    const existingComment = await Comment.findOne({ 
      product: productId, 
      user: req.user.id 
    });

    if (existingComment) {
      return res.status(400).json({
        success: false,
        message: "Ya has dejado una reseña para este producto",
      });
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    const comment = await Comment.create({
      product: productId,
      user: req.user.id,
      rating,
      text,
    });

    // Populate para devolver datos del usuario
    await comment.populate("user", "nombre");

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Error en createComment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verificar si el usuario ya dejó una reseña
// @route   GET /api/comments/status/:productId
// @access  Private
const checkReviewStatus = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      product: req.params.productId,
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      hasReviewed: !!comment
    });
  } catch (error) {
    console.error("Error en checkReviewStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener comentarios de un producto
// @route   GET /api/comments/product/:productId
// @access  Public
const getCommentsByProduct = async (req, res) => {
  try {
    const comments = await Comment.find({ product: req.params.productId })
      .populate("user", "nombre")
      .sort({ createdAt: -1 });

    // Calcular promedio de rating
    const avgRating = comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: comments,
      averageRating: avgRating,
      count: comments.length,
    });
  } catch (error) {
    console.error("Error en getCommentsByProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Eliminar un comentario
// @route   DELETE /api/comments/:id
// @access  Private (solo quien lo creó o admin)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comentario no encontrado",
      });
    }

    // Solo el autor o admin puede eliminar
    if (comment.user.toString() !== req.user.id && req.user.role !== "administrador") {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comentario eliminado",
    });
  } catch (error) {
    console.error("Error en deleteComment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener comentarios hacia un vendedor (sus productos)
// @route   GET /api/comments/vendor/:vendorId
// @access  Public
const getCommentsByVendor = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId }).select('_id');
    const productIds = products.map(p => p._id);
    
    const comments = await Comment.find({ product: { $in: productIds } })
      .populate("user", "nombre")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    const avgRating = comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: comments,
      averageRating: avgRating,
      count: comments.length,
    });
  } catch (error) {
    console.error("Error en getCommentsByVendor:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener comentarios que ha hecho un usuario específico
// @route   GET /api/comments/user
// @access  Private
const getCommentsByUser = async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.user.id })
      .populate("product", "name images price slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments,
      count: comments.length,
    });
  } catch (error) {
    console.error("Error en getCommentsByUser:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getCommentsByProduct,
  getCommentsByVendor,
  getCommentsByUser,
  deleteComment,
  checkReviewStatus,
};
