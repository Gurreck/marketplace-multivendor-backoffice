import React, { useState, useEffect } from "react";
import "./pageVendedor.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';


export default function PageVendedor() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToCart, cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();

  // ===== ESTADO Y COMPONENTES =====
  const [products, setProducts] = useState([]); // Lista de productos del vendedor
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Manejo de errores
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [selectedCategory, setSelectedCategory] = useState("Todos"); // Categoría seleccionada
  const [showNotification, setShowNotification] = useState(""); // Mensajes de notificación

  // ===== ESTADO DEL MODAL Y FORMULARIO =====
  const [isModalOpen, setIsModalOpen] = useState(false); // Control del modal
  const [editingProduct, setEditingProduct] = useState(null); // Producto en edición (null si es nuevo)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
  });
  const [imageFiles, setImageFiles] = useState([]); // Archivos de imagen seleccionados para subir
  const [imagePreviews, setImagePreviews] = useState([]); // Vistas previas de nuevas imágenes
  const [existingImages, setExistingImages] = useState([]); // Imágenes que ya tiene el producto en el servidor

  // ===== CONFIGURACIÓN Y CATÁLOGOS =====

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

  // ===== CARGA DE DATOS =====
  useEffect(() => {
    fetchMyProducts();
  }, []);

  /**
   * Obtiene los productos del vendedor autenticado
   */
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



  // ===== MANEJO DE FORMULARIO E IMÁGENES =====
  /**
   * Actualiza el estado del formulario al escribir en los inputs
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Maneja la selección de archivos de imagen y genera vistas previas
   */
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

  // ===== ACCIONES DE MODAL =====
  /**
   * Prepara el modal para agregar un nuevo producto
   */
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

  /**
   * Prepara el modal para editar un producto existente
   */
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

  // ===== PERSISTENCIA Y API =====
  /**
   * Envía los datos del producto (crear o editar) al servidor
   */
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

  /**
   * Elimina un producto tras confirmación del usuario
   */
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

  // ===== LÓGICA DE FILTRADO =====
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <>
      <div className={`barra-navegacion-secundaria ${!isDarkMode ? 'modo-claro' : ''}`}>
        <NavbarSecundario
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          user={user}
          logout={logout}
          cartCount={cartCount}
          onInicio={() => {
            logout();
            navigate('/');
          }}
          disableCart={true}
          disableUserMenu={true}
        />
      </div>
      <div className={`contenedor-principal-vendedor ${!isDarkMode ? "modo-claro" : ""}`}>
        {showNotification && (
          <div className="notificacion">{showNotification}</div>
        )}
        {/* <DivPromo
        //products={allProducts}
        handlePromoAddToCart={handlePromoAddToCart}
      /> */}
        <div className="contenedor-principal-productos">
          <section className="seccion-productos">
            <div className="encabezado-seccion">
              <h2>
                Mis Productos{" "}
                {selectedCategory !== "Todos" && `— ${selectedCategory}`}
              </h2>
              <div className="acciones-encabezado">

                <p>{filteredProducts.length} productos publicados</p>
                <button className="boton-agregar-vendedor" onClick={openAddModal}>
                  ➕ Nuevo Producto
                </button>
              </div>
            </div>

            {loading ? (
              <div className="contenedor-carga">
                <div className="indicador-carga"></div>
                <p>Cargando tus productos...</p>
              </div>
            ) : error ? (
              <div className="estado-vacio">
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
              <div className="cuadricula-productos">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="tarjeta-producto">
                    <div className="imagen-producto">
                      <img
                        src={
                          product.images[0]?.url ||
                          "https://via.placeholder.com/300"
                        }
                        alt={product.name}
                        className="imagen-real-producto"
                      />
                      <div className="etiqueta-producto">{product.category}</div>
                    </div>

                    <div className="informacion-producto">
                      <h3 className="nombre-producto">{product.name}</h3>
                      <p className="descripcion-corta-producto">
                        {product.description?.substring(0, 60)}...
                      </p>
                      <div className="meta-tarjeta">
                        <span className="precio-producto">
                          ₡{product.price.toLocaleString()}
                        </span>
                        <span className="existencias-tarjeta">Stock: {product.stock}</span>
                      </div>

                      <div className="pie-pagina-producto-vendedor">
                        <button
                          className="boton-editar"
                          onClick={() => openEditModal(product)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="boton-eliminar"
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
          <div className="capa-modal">
            <div className="contenido-modal">
              <div className="encabezado-modal">
                <h2>
                  {editingProduct ? "Editar Producto" : "Subir Nuevo Producto"}
                </h2>
                <button
                  className="cerrar-modal"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <form className="formulario-producto" onSubmit={handleSubmit}>
                <div className="grupo-formulario">
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

                <div className="fila-formulario">
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
                    <div className="contenedor-vistas-previas-imagenes">
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#aaa",
                          marginBottom: "8px",
                        }}
                      >
                        Imágenes actuales:
                      </p>
                      <div className="cuadricula-vistas-previas-imagenes">
                        {existingImages.map((img, index) => (
                          <div
                            key={`existing-${index}`}
                            className="item-vista-previa-imagen"
                          >
                            <img src={img.url} alt={`Existente ${index + 1}`} />
                            <button
                              type="button"
                              className="boton-quitar-vista-previa"
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
                  <div className="area-carga-archivos">
                    <label className="boton-carga-archivos">
                      📁 Seleccionar imágenes
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                    </label>
                    <span className="sugerencia-carga-archivos">
                      Máx. 5 imágenes (JPEG, PNG, GIF, WebP) — 5MB c/u
                    </span>
                  </div>
                </div>

                <div className="acciones-formulario-modal">
                  <button
                    type="button"
                    className="boton-secundario-modal"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton-primario-modal">
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
