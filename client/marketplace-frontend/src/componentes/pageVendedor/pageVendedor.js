import React, { useState, useEffect } from 'react';
import './pageVendedor.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PageVendedor() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        stock: '',
        images: [''] // Array of URLs
    });

    const categories = ['Computadoras', 'Audio', 'Pantallas', 'Periféricos', 'Tablets', 'Wearables', 'Cámaras', 'Accesorios'];

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            setLoading(true);
            // Backend route: router.get("/vendor/me", protect, authorize("vendedor"), getProducts);
            // Wait, let's check productController.js getProducts: 
            // if (req.query.vendor === "me" && req.user) { query.vendor = req.user.id; }
            const response = await api.get('/products/vendor/me');
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('No se pudieron cargar tus productos. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({
            ...formData,
            images: newImages
        });
    };

    const addImageField = () => {
        setFormData({
            ...formData,
            images: [...formData.images, '']
        });
    };

    const removeImageField = (index) => {
        if (formData.images.length > 1) {
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData({
                ...formData,
                images: newImages
            });
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: categories[0],
            brand: '',
            stock: '0',
            images: ['']
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            brand: product.brand || '',
            stock: product.stock,
            images: product.images.length > 0 ? product.images : ['']
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean empty image URLs
            const cleanedImages = formData.images.filter(img => img.trim() !== '');
            if (cleanedImages.length === 0) {
                alert('Debes incluir al menos una URL de imagen válida.');
                return;
            }

            const dataToSubmit = {
                ...formData,
                images: cleanedImages,
                price: Number(formData.price),
                stock: Number(formData.stock)
            };

            let response;
            if (editingProduct) {
                response = await api.put(`/products/${editingProduct._id}`, dataToSubmit);
            } else {
                response = await api.post('/products', dataToSubmit);
            }

            if (response.data.success) {
                setIsModalOpen(false);
                fetchMyProducts();
                alert(editingProduct ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
            }
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Error al guardar el producto: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                const response = await api.delete(`/products/${id}`);
                if (response.data.success) {
                    fetchMyProducts();
                    alert('Producto eliminado');
                }
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Error al eliminar el producto.');
            }
        }
    };

    return (
        <div className="vendor-dashboard">
            <header className="vendor-header">
                <div className="vendor-logo" onClick={() => navigate('/vendedor/dashboard')}>
                    <img src={logo} alt="Nexora Logo" />
                    <h2>Nexora Vendor</h2>
                </div>

                <div className="vendor-user-actions">
                    <span>Hola, <strong>{user?.nombre || 'Vendedor'}</strong></span>
                    <button className="btn-icon" onClick={() => { logout(); navigate('/login'); }} title="Cerrar Sesión">
                        ✖
                    </button>
                </div>
            </header>

            <main className="vendor-content">
                <div className="content-header">
                    <h1>Mis Productos</h1>
                    <button className="btn-primary" onClick={openAddModal}>
                        <span>+</span> Nuevo Producto
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando tus productos...</p>
                    </div>
                ) : error ? (
                    <div className="empty-dashboard">
                        <span className="empty-icon">⚠️</span>
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={fetchMyProducts}>Reintentar</button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-dashboard">
                        <span className="empty-icon">📦</span>
                        <h3>No tienes productos en venta</h3>
                        <p>Comienza agregando tu primer producto para que los clientes puedan verlo.</p>
                        <button className="btn-primary" onClick={openAddModal}>Agregar Producto</button>
                    </div>
                ) : (
                    <div className="products-management-grid">
                        {products.map((product) => (
                            <div key={product._id} className="vendor-product-card">
                                <div className="card-img-container">
                                    <img src={product.images[0]} alt={product.name} />
                                    <span className="card-category-badge">{product.category}</span>
                                </div>

                                <div className="card-info">
                                    <h3>{product.name}</h3>
                                    <p className="card-desc">{product.description}</p>

                                    <div className="card-meta">
                                        <span className="card-price">${product.price}</span>
                                        <span className="card-stock">Stock: {product.stock}</span>
                                    </div>

                                    <div className="card-actions">
                                        <button className="btn-action btn-edit" onClick={() => openEditModal(product)}>
                                            ✏️ Editar
                                        </button>
                                        <button className="btn-action btn-delete" onClick={() => handleDelete(product._id)}>
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Editar Producto' : 'Subir Nuevo Producto'}</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
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
                                    <label>Precio ($)</label>
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
                                    <select name="category" value={formData.category} onChange={handleInputChange}>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
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
                                        placeholder="EjBase: Dell, Sony..."
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>URLs de Imágenes</label>
                                {formData.images.map((url, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            required={index === 0}
                                        />
                                        {formData.images.length > 1 && (
                                            <button type="button" className="btn-icon" onClick={() => removeImageField(index)} style={{ borderRadius: '8px', width: '35px', height: '35px' }}>
                                                -
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="btn-action" onClick={addImageField} style={{ width: 'fit-content' }}>
                                    + Añadir otra URL de imagen
                                </button>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary submit-btn">
                                    {editingProduct ? 'Guardar Cambios' : 'Publicar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
