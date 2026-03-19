import React, { useState, useEffect } from 'react';
import './pageViewProduct.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import DivPromo from '../divPromo/divPromo';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';


const PageViewProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [showNotification, setShowNotification] = useState('');

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
                    cartCount={0}
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
                    <button className="home-btn" onClick={() => navigate('/')}> Inicio</button>
                    {/* ...existing code... */}
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
        </>
    );
}
export default PageViewProduct;
