import { useState, useCallback } from "react";
import api from "../../../services/api";

/**
 * Hook que maneja toda la lógica de productos del Vendedor.
 */
export default function useVendedorProductos({ mostrarNotificacion, categories }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [stockThreshold, setStockThreshold] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const cargarProductos = useCallback(async () => {
    try {
      const response = await api.get("/products/vendor/me");
      if (response.data.success) {
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setProducts(sorted);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const totalImages = imageFiles.length + files.length;
    if (totalImages > 5) {
      alert("Máximo 5 imágenes permitidas.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: categories.length > 1 ? categories[1] : "",
      brand: "",
      stock: "0",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || "",
      stock: product.stock,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (imageFiles.length === 0 && existingImages.length === 0) {
        alert("Debes incluir al menos una imagen.");
        return;
      }
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", Number(formData.price));
      submitData.append("stock", Number(formData.stock));
      submitData.append("category", formData.category);
      submitData.append("brand", formData.brand);
      imageFiles.forEach((file) => {
        submitData.append("images", file);
      });
      if (editingProduct) {
        const imagesToRemove = editingProduct.images.filter(
          (img) => !existingImages.some((e) => e.public_id === img.public_id),
        );
        submitData.append("removeImages", JSON.stringify(imagesToRemove));
      }
      let response;
      if (editingProduct) {
        response = await api.put(
          `/products/${editingProduct._id}`,
          submitData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      } else {
        response = await api.post("/products", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (response.data.success) {
        setIsModalOpen(false);
        cargarProductos();
        mostrarNotificacion(
          editingProduct
            ? "Producto actualizado con éxito"
            : "Producto creado con éxito",
        );
      }
    } catch (err) {
      console.error("Error saving product:", err);
      mostrarNotificacion(
        "Error al guardar el producto: " +
          (err.response?.data?.message || err.message),
        "error",
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        const response = await api.delete(`/products/${id}`);
        if (response.data.success) {
          cargarProductos();
          mostrarNotificacion("Producto eliminado");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        mostrarNotificacion("Error al eliminar el producto.", "error");
      }
    }
  };

  const handleToggleProduct = async (product) => {
    try {
      const response = await api.put(`/products/${product._id}/toggle`);
      if (response.data.success) {
        cargarProductos();
        mostrarNotificacion(
          product.active === false ? "Producto activado" : "Producto desactivado",
        );
      }
    } catch (err) {
      try {
        const submitData = new FormData();
        submitData.append("active", product.active === false ? true : false);
        await api.put(`/products/${product._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        cargarProductos();
        mostrarNotificacion(
          product.active === false ? "Producto activado" : "Producto desactivado",
        );
      } catch (err2) {
        mostrarNotificacion("Error al cambiar estado del producto", "error");
      }
    }
  };

  const handleUpdateStock = async (product, newStock) => {
    try {
      const submitData = new FormData();
      submitData.append("name", product.name);
      submitData.append("description", product.description);
      submitData.append("price", product.price);
      submitData.append("stock", Number(newStock));
      submitData.append("category", product.category);
      submitData.append("brand", product.brand || "");
      await api.put(`/products/${product._id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cargarProductos();
      mostrarNotificacion("Stock actualizado");
    } catch (err) {
      mostrarNotificacion("Error al actualizar stock", "error");
    }
  };

  // ===== FILTROS =====
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "todos"
        ? true
        : filterStatus === "activos"
          ? product.active !== false
          : filterStatus === "inactivos"
            ? product.active === false
            : filterStatus === "stock_bajo"
              ? product.stock <= stockThreshold && product.active !== false
              : true;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  return {
    filteredProducts, searchTerm, setSearchTerm, filterStatus, setFilterStatus,
    selectedCategory, setSelectedCategory, stockThreshold, setStockThreshold,
    isModalOpen, setIsModalOpen, editingProduct, formData, imageFiles, imagePreviews,
    existingImages, handleInputChange, handleFileSelect, removeNewImage, removeExistingImage,
    openAddModal, openEditModal, handleSubmit, handleDelete, handleToggleProduct,
    handleUpdateStock, cargarProductos,
  };
}

