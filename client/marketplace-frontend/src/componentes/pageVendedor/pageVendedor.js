import React, { useState, useEffect } from 'react';
import './pageVendedor.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import DivPromo from '../divPromo/divPromo';

export default function PageVendedor() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showNotification, setShowNotification] = useState('');

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

    const categories = ['Todos', 'Computadoras', 'Audio', 'Pantallas', 'Periféricos', 'Tablets', 'Wearables', 'Cámaras', 'Accesorios'];

    useEffect(() => {
        fetchMyProducts();
        fetchAllProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            setLoading(true);
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

    const fetchAllProducts = async () => {
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                setAllProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching all products:', error);
        }
    };

    const handlePromoAddToCart = (product) => {
        const discountedProduct = {
            ...product,
            originalPrice: product.price,
            price: Math.floor(product.price * 0.90),
            isPromo: true
        };
        addToCart(discountedProduct);
        setShowNotification(`${product.name} (Oferta 10%) agregado al carrito`);
        setTimeout(() => setShowNotification(''), 3000);
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
            category: categories[1], // Computadoras
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

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={`principal-container ${!isDarkMode ? 'light-mode' : ''}`}>
            {showNotification && <div className="notification">{showNotification}</div>}
            <DivPromo products={allProducts} handlePromoAddToCart={handlePromoAddToCart} />
            <div className="main-container">
                <section className="products-section">
                    <div className="section-header">
                        <h2>Mis Productos {selectedCategory !== 'Todos' && `— ${selectedCategory}`}</h2>
                        <div className="header-actions">
                            <button className="btn-exit-vendedor" onClick={() => { logout(); navigate('/login'); }}>
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
                            <button className="add-btn" onClick={fetchMyProducts}>Reintentar</button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <p>📦 No tienes productos en esta categoría</p>
                            <button className="add-btn" onClick={openAddModal}>➕ Agregar Producto</button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="product-card">
                                    <div className="product-image">
                                        <img src={product.images[0]} alt={product.name} className="product-real-image" />
                                        <div className="product-badge">{product.category}</div>
                                    </div>

                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-short-desc">{product.description?.substring(0, 60)}...</p>
                                        <div className="card-meta">
                                            <span className="product-price">${product.price}</span>
                                            <span className="card-stock">Stock: {product.stock}</span>
                                        </div>

                                        <div className="product-footer-vendedor">
                                            <button className="btn-edit" onClick={() => openEditModal(product)}>✏️ Editar</button>
                                            <button className="btn-delete" onClick={() => handleDelete(product._id)}>🗑️ Borrar</button>
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
                                        {categories.filter(c => c !== 'Todos').map(cat => (
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
                                        placeholder="Ej: Dell, Sony..."
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
                                            <button type="button" className="btn-icon-minus" onClick={() => removeImageField(index)}>
                                                -
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="btn-add-img" onClick={addImageField}>
                                    + Añadir otra URL de imagen
                                </button>
                            </div>

                            <div className="form-actions-modal">
                                <button type="button" className="btn-secondary-modal" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary-modal">
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
