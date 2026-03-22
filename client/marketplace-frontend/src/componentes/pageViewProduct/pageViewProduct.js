import React, { useState, useEffect } from 'react';
import './pageViewProduct.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { commentService } from '../../services/commentService';

import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import ModalLogin from '../Modal/ModalLogin';

const PageViewProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
 
    const { user, isAuthenticated, logout } = useAuth();
    const { addToCart, cartCount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();

 
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);

    // ESTADO PARA COMENTARIOS (desde backend)
    const [comments, setComments] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loadingComments, setLoadingComments] = useState(true);

    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(5);

    const [showNotification, setShowNotification] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        fetchProductDetail();
        fetchComments();
    }, [id]);

    // Función para cargar comentarios desde el backend
    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const response = await commentService.getCommentsByProduct(id);
            if (response.data.success) {
                setComments(response.data.data);
                setAverageRating(response.data.averageRating);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoadingComments(false);
        }
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

    const handleSubmitComment = async () => {
        if (newComment.trim() === "") return;
        
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        
        try {
            const response = await commentService.createComment({
                productId: id,
                rating: newRating,
                text: newComment,
            });
            
            if (response.data.success) {
                setNewComment("");
                setNewRating(5);
                fetchComments(); // Recargar comentarios
                setShowNotification("Comentario publicado exitosamente");
                setTimeout(() => setShowNotification(""), 3000);
            }
        } catch (error) {
            console.error("Error creating comment:", error);
            setShowNotification("Error al publicar comentario");
            setTimeout(() => setShowNotification(""), 3000);
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
            <ModalLogin 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)}
                onLogin={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                }}
                mensaje="Debes iniciar sesión para agregar productos al carrito"
            />
            <div className={`navbar-secundario ${!isDarkMode ? 'light-mode' : ''}`}>
                <NavbarSecundario
                    toggleTheme={toggleTheme}
                    isDarkMode={isDarkMode}
                    user={user}
                    logout={logout}
                    cartCount={cartCount}
                />
            </div>
            <div className={`product-page-container ${!isDarkMode ? 'light-mode' : ''}`}>
                {showNotification && (
                    <div className="notification">
                        ✓ {showNotification}
                    </div>
                )}





            <div className="product-page-content">

                <div className="main-content-layout">
                    <div className="image-section">
                        <div className="main-image-container">
                            <img
                                src={selectedProduct.images[currentImageIndex]?.url || "https://via.placeholder.com/600"}
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
                                        <img src={image.url || "https://via.placeholder.com/120"} alt={`Vista ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SECCIÓN DE COMENTARIOS - Debajo de la imagen */}
                        <div className="comments-section">
                            <div className="comments-header">
                                <h3>💬 Opiniones de Clientes</h3>
                                <div className="rating-summary">
                                    <span className="rating-number">{averageRating || "0"}</span>
                                    <div className="rating-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < Math.round(averageRating || 0) ? "star filled" : "star"}>★</span>
                                        ))}
                                    </div>
                                    <span className="rating-count">({comments.length} comentarios)</span>
                                </div>
                            </div>

                            {/* Formulario para nuevo comentario */}
                            <div className="comment-form">
                                <div className="rating-select">
                                    <label>Tu calificación:</label>
                                    <div className="stars-input">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span 
                                                key={star}
                                                className={star <= newRating ? "star active" : "star"}
                                                onClick={() => setNewRating(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    className="comment-input"
                                    placeholder="Escribe tu opinión sobre el producto..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button className="comment-submit-btn" onClick={handleSubmitComment}>
                                    Publicar Comentario
                                </button>
                            </div>

                            {/* Lista de comentarios */}
                            <div className="comments-list">
                                {loadingComments ? (
                                    <p style={{textAlign: 'center', color: 'var(--nexora-text-secondary)'}}>Cargando comentarios...</p>
                                ) : comments.length === 0 ? (
                                    <p style={{textAlign: 'center', color: 'var(--nexora-text-secondary)'}}>Aún no hay comentarios. ¡Sé el primero en opinar!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment._id} className="comment-item">
                                            <div className="comment-header">
                                                <img src={`https://i.pravatar.cc/150?img=${comment.user?.nombre ? comment.user.nombre.charCodeAt(0) % 70 : 1}`} alt={comment.user?.nombre || "Usuario"} className="comment-avatar" />
                                                <div className="comment-info">
                                                    <span className="comment-user">{comment.user?.nombre || "Usuario"}</span>
                                                    <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString("es-CR")}</span>
                                                </div>
                                                <div className="comment-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < comment.rating ? "star filled" : "star"}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="comment-text">{comment.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
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
                                                <img src={product.images[0]?.url || "https://via.placeholder.com/120"} alt={product.name} />
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
