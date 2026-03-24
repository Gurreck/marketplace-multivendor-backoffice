import React, { useState, useEffect } from "react";
import "./pageVendedor.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import { 
  PlusCircle, 
  RotateCcw, 
  Package, 
  Pencil, 
  Trash2, 
  X, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Image as ImageIcon,
  Tag,
  Boxes,
  Briefcase
} from 'lucide-react';

export default function PageVendedor() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showNotification, setShowNotification] = useState("");

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
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products/vendor/me");
      if (response.data.success) {
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
        setShowNotification(editingProduct ? "Producto actualizado con éxito" : "Producto creado con éxito");
        setTimeout(() => setShowNotification(""), 3000);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Error al guardar el producto: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        const response = await api.delete(`/products/${id}`);
        if (response.data.success) {
          fetchMyProducts();
          setShowNotification("Producto eliminado");
          setTimeout(() => setShowNotification(""), 3000);
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error al eliminar el producto.");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          <div className="notificacion">
            <CheckCircle2 size={18} style={{ marginRight: '8px' }} />
            {showNotification}
          </div>
        )}

        <div className="contenedor-principal-productos">
          <section className="seccion-productos">
            <div className="encabezado-seccion">
              <h2>
                <Package size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Mis Productos{" "}
                {selectedCategory !== "Todos" && `— ${selectedCategory}`}
              </h2>
              <div className="acciones-encabezado">
                <p>{filteredProducts.length} productos publicados</p>
                <button className="boton-agregar-vendedor" onClick={openAddModal}>
                  <PlusCircle size={18} style={{ marginRight: '8px' }} /> Nuevo Producto
                </button>
              </div>
            </div>

            {loading ? (
              <div className="contenedor-carga">
                <Loader2 className="animacion-giro" size={40} />
                <p>Cargando tus productos...</p>
              </div>
            ) : error ? (
              <div className="estado-vacio">
                <AlertTriangle size={40} color="var(--admin-peligro)" />
                <p>{error}</p>
                <button className="add-btn" onClick={fetchMyProducts}>
                  <RotateCcw size={16} style={{ marginRight: '8px' }} /> Reintentar
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <Boxes size={48} opacity={0.3} />
                <p>No tienes productos en esta categoría</p>
                <button className="add-btn" onClick={openAddModal}>
                  <PlusCircle size={18} style={{ marginRight: '8px' }} /> Agregar Producto
                </button>
              </div>
            ) : (
              <div className="cuadricula-productos">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="tarjeta-producto">
                    <div className="imagen-producto">
                      <img
                        src={product.images[0]?.url || "https://via.placeholder.com/300"}
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
                          <Pencil size={14} style={{ marginRight: '6px' }} /> Editar
                        </button>
                        <button
                          className="boton-eliminar"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 size={14} style={{ marginRight: '6px' }} /> Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {isModalOpen && (
          <div className="capa-modal">
            <div className="contenido-modal">
              <div className="encabezado-modal">
                <h2>
                  {editingProduct ? <><Pencil size={20} style={{ marginRight: '10px' }} /> Editar Producto</> : <><PlusCircle size={20} style={{ marginRight: '10px' }} /> Subir Nuevo Producto</>}
                </h2>
                <button
                  className="cerrar-modal"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form className="formulario-producto" onSubmit={handleSubmit}>
                <div className="grupo-formulario">
                  <label><Briefcase size={14} style={{ marginRight: '6px' }} /> Nombre del Producto</label>
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
                    <label><Boxes size={14} style={{ marginRight: '6px' }} /> Stock Disponible</label>
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
                    <label><Tag size={14} style={{ marginRight: '6px' }} /> Categoría</label>
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
                  <label><ImageIcon size={14} style={{ marginRight: '6px' }} /> Imágenes del Producto</label>

                  {existingImages.length > 0 && (
                    <div className="contenedor-vistas-previas-imagenes">
                      <p className="subtitulo-imagenes">Imágenes actuales:</p>
                      <div className="cuadricula-vistas-previas-imagenes">
                        {existingImages.map((img, index) => (
                          <div key={`existing-${index}`} className="item-vista-previa-imagen">
                            <img src={img.url} alt={`Existente ${index + 1}`} />
                            <button
                              type="button"
                              className="boton-quitar-vista-previa"
                              onClick={() => removeExistingImage(index)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imagePreviews.length > 0 && (
                    <div className="image-previews-container">
                      <p className="subtitulo-imagenes">Nuevas imágenes:</p>
                      <div className="image-previews-grid">
                        {imagePreviews.map((preview, index) => (
                          <div key={`new-${index}`} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              className="btn-remove-preview"
                              onClick={() => removeNewImage(index)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="area-carga-archivos">
                    <label className="boton-carga-archivos">
                      <UploadCloud size={20} style={{ marginRight: '10px' }} />
                      Seleccionar imágenes
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
