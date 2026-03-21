import React, { useState, useEffect } from "react";
import "./pageVendedor.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';


export default function PageVendedor() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState([]);
  //const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotification, setShowNotification] = useState("");

  // State for Modal
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
  const [imageFiles, setImageFiles] = useState([]); // Archivos seleccionados
  const [imagePreviews, setImagePreviews] = useState([]); // Vista previa de imágenes
  const [existingImages, setExistingImages] = useState([]); // Imágenes existentes (al editar)

  const categories = [
    "Todos",
    "Computadoras",
    "Audio",
    "Pantallas",
    "Periféricos",
    "Tablets",
    "Wearables",
    "Cámaras",
    "Accesorios",
  ];

  useEffect(() => {
    fetchMyProducts();
    //fetchAllProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products/vendor/me");
      if (response.data.success) {
        // Ordenar por fecha de creación descendente (más recientes primero)
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setProducts(sorted);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(
        "No se pudieron cargar tus productos. Por favor, intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limitar a 5 imágenes en total
    const totalImages = imageFiles.length + files.length;
    if (totalImages > 5) {
      alert("Máximo 5 imágenes permitidas.");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    // Generar vista previa
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
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
      category: categories[1],
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
      // Validar que haya al menos una imagen (nueva o existente)
      if (imageFiles.length === 0 && existingImages.length === 0) {
        alert("Debes incluir al menos una imagen.");
        return;
      }

      // Construir FormData para enviar archivos
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", Number(formData.price));
      submitData.append("stock", Number(formData.stock));
      submitData.append("category", formData.category);
      submitData.append("brand", formData.brand);

      // Agregar archivos nuevos
      imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      // Si estamos editando y mantenemos imágenes existentes (sin subir nuevas)
      // ✅ Enviar imágenes a eliminar (para Cloudinary)
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
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        response = await api.post("/products", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        setIsModalOpen(false);
        fetchMyProducts();
        alert(
          editingProduct
            ? "Producto actualizado con éxito"
            : "Producto creado con éxito",
        );
      }
    } catch (err) {
      console.error("Error saving product:", err);
      alert(
        "Error al guardar el producto: " +
        (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        const response = await api.delete(`/products/${id}`);
        if (response.data.success) {
          fetchMyProducts();
          alert("Producto eliminado");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error al eliminar el producto.");
      }
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="navbar-secundario">
        <NavbarSecundario
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          user={user}
          logout={logout}
          cartCount={cartCount}
          // Aquí le pasamos la instrucción especial solo para la vista de vendedor:
          // Al hacer clic en inicio/logo, deslogueará al usuario y lo mandará al home
          onInicio={() => {
            logout();
            navigate("/");
          }}
        />
      </div>
      <div className={`principal-container ${!isDarkMode ? "light-mode" : ""}`}>
        {showNotification && (
          <div className="notification">{showNotification}</div>
        )}

        <div className="main-container">
          <section className="products-section">
            <div className="section-header">
              <h2>
                Mis Productos{" "}
                {selectedCategory !== "Todos" && `— ${selectedCategory}`}
              </h2>
              <div className="header-actions">
                <button
                  className="btn-exit-vendedor"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  ✖ Salir
                </button>
                <p>{filteredProducts.length} productos publicados</p>
                <button className="add-btn-vendedor" onClick={openAddModal}>
                  ➕ Nuevo Producto
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando tus productos...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <p>⚠️ {error}</p>
                <button className="add-btn" onClick={fetchMyProducts}>
                  Reintentar
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p>📦 No tienes productos en esta categoría</p>
                <button className="add-btn" onClick={openAddModal}>
                  ➕ Agregar Producto
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      <img
                        src={
                          product.images[0]?.url ||
                          "https://via.placeholder.com/300"
                        }
                        alt={product.name}
                        className="product-real-image"
                      />
                      <div className="product-badge">{product.category}</div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-short-desc">
                        {product.description?.substring(0, 60)}...
                      </p>
                      <div className="card-meta">
                        <span className="product-price">
                          ₡{product.price.toLocaleString()}
                        </span>
                        <span className="card-stock">Stock: {product.stock}</span>
                      </div>

                      <div className="product-footer-vendedor">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(product)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          🗑️ Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  {editingProduct ? "Editar Producto" : "Subir Nuevo Producto"}
                </h2>
                <button
                  className="close-modal"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre del Producto</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Laptop Dell XPS 15"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe las características principales..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio (₡)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Disponible</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {categories
                        .filter((c) => c !== "Todos")
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Marca (Opcional)</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Ej: Dell, Sony..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Imágenes del Producto</label>

                  {/* Imágenes existentes (al editar) */}
                  {existingImages.length > 0 && (
                    <div className="image-previews-container">
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#aaa",
                          marginBottom: "8px",
                        }}
                      >
                        Imágenes actuales:
                      </p>
                      <div className="image-previews-grid">
                        {existingImages.map((img, index) => (
                          <div
                            key={`existing-${index}`}
                            className="image-preview-item"
                          >
                            <img src={img.url} alt={`Existente ${index + 1}`} />
                            <button
                              type="button"
                              className="btn-remove-preview"
                              onClick={() => removeExistingImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vista previa de nuevas imágenes */}
                  {imagePreviews.length > 0 && (
                    <div className="image-previews-container">
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#aaa",
                          marginBottom: "8px",
                        }}
                      >
                        Nuevas imágenes:
                      </p>
                      <div className="image-previews-grid">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={`new-${index}`}
                            className="image-preview-item"
                          >
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              className="btn-remove-preview"
                              onClick={() => removeNewImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón para seleccionar archivos */}
                  <div className="file-upload-area">
                    <label className="btn-file-upload">
                      📁 Seleccionar imágenes
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                    </label>
                    <span className="file-upload-hint">
                      Máx. 5 imágenes (JPEG, PNG, GIF, WebP) — 5MB c/u
                    </span>
                  </div>
                </div>

                <div className="form-actions-modal">
                  <button
                    type="button"
                    className="btn-secondary-modal"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-modal">
                    {editingProduct ? "Guardar Cambios" : "Publicar Producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
