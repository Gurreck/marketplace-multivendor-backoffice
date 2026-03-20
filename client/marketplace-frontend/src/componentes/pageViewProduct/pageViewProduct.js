import React, { useState, useEffect } from 'react';
import './pageViewProduct.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import DivPromo from '../divPromo/divPromo';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import ModalLogin from '../Modal/ModalLogin';

const PageViewProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
 
    const { user } = useAuth();
    const { addToCart, cartCount } = useCart();

 
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [showNotification, setShowNotification] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        fetchProductDetail();
        fetchAllProducts();
    }, [id]);

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
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
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

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            if (response.data.success) {
                setSelectedProduct(response.data.data);
                // Fetch similar products
                fetchSimilarProducts(response.data.data.category, response.data.data._id);
            }
        } catch (error) {
            console.error('Error fetching product detail:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchSimilarProducts = async (category, currentId) => {
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                const filtered = response.data.data.filter(p => p.category === category && p._id !== currentId);
                setSimilarProducts(filtered.slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    };

    const goToPreviousImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? selectedProduct.images.length - 1 : prev - 1
        );
    };

    const goToNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === selectedProduct.images.length - 1 ? 0 : prev + 1
        );
    };

    if (loading) return (
        <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0094FF', fontSize: '24px' }}>
            Cargando producto...
        </div>
    );

    if (!selectedProduct) return null;

    return (

        <>
            <div className="navbar-secundario">
                <NavbarSecundario
                    toggleTheme={() => { }}
                    isDarkMode={false}
                    user={user}
                    logout={() => { }}
                    cartCount={cartCount}
                />
            </div>
            <div className="product-page-container">
                {showNotification && (
                    <div className="notification">
                        ✓ {showNotification}
                    </div>
                )}
                <DivPromo products={allProducts} handlePromoAddToCart={handlePromoAddToCart} />




            <div className="product-page-content">

                <div className="main-content-layout">
                    <div className="image-section">
                        <div className="main-image-container">
                            <img
                                src={selectedProduct.images[currentImageIndex]}
                                alt={selectedProduct.name}
                                className="product-main-image"
                            />

                            {selectedProduct.images.length > 1 && (
                                <>
                                    <button className="image-nav-btn prev" onClick={goToPreviousImage}>◀</button>
                                    <button className="image-nav-btn next" onClick={goToNextImage}>▶</button>
                                </>
                            )}
                        </div>

                        {selectedProduct.images.length > 1 && (
                            <div className="image-thumbnails">
                                {selectedProduct.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <img src={image} alt={`Vista ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="info-section">
                        <h1 className="product-name">{selectedProduct.name}</h1>

                        <div className="description-box">
                            <h3>Descripción</h3>
                            <p>{selectedProduct.description}</p>
                        </div>

                        <div className="category-tag">
                            Categoría: <strong>{selectedProduct.category}</strong>
                        </div>

                        <div className="product-meta">
                            <div className="vendor">
                                Vendedor: <strong>{selectedProduct.vendor?.nombre || selectedProduct.vendor}</strong>
                            </div>
                        </div>

                        <div className="price-tag">
                            <span className="product-price"> ₡ {selectedProduct.price.toLocaleString()}</span>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="add-to-cart-btn"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        setShowLoginModal(true);
                                        return;
                                    }
                                    addToCart(selectedProduct);
                                    setShowNotification(`${selectedProduct.name} agregado al carrito`);
                                    setTimeout(() => setShowNotification(''), 3000);
                                }}



                                
                            >
                                ➕ Agregar al Carrito
                            </button>
                        </div>

                        {/* Productos Similares */}
                        {similarProducts.length > 0 && (
                            <div className="similar-products-section">
                                <h3>🔍 Productos Similares</h3>
                                <div className="similar-products-grid">
                                    {similarProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className="similar-product-card"
                                            onClick={() => {
                                                navigate(`/product/${product._id}`);
                                                setCurrentImageIndex(0);
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            <div className="similar-image">
                                                <img src={product.images[0]} alt={product.name} />
                                            </div>
                                            <div className="similar-info">
                                                <p className="similar-name">{product.name}</p>
                                                <p className="similar-price">₡{product.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default PageViewProduct;
