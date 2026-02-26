import React, { useState, useEffect } from 'react';
import './pageViewProduct.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';

const PageViewProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [commentRating, setCommentRating] = useState(5);
    const [comments, setComments] = useState({});
    const [showNotification, setShowNotification] = useState('');

    useEffect(() => {
        const product = products.find(p => p.id === parseInt(id));
        if (product) {
            setSelectedProduct(product);
        } else {
            navigate('/');
        }
    }, [id, navigate]);

    const handleAddComment = () => {
        if (!newComment.trim()) {
            alert('Por favor escribe un comentario');
            return;
        }

        const productId = selectedProduct.id;
        const comment = {
            id: Date.now(),
            author: user?.email?.split('@')[0] || 'Usuario',
            text: newComment,
            rating: commentRating,
            date: new Date().toLocaleDateString('es-ES')
        };

        setComments({
            ...comments,
            [productId]: [...(comments[productId] || []), comment]
        });

        setNewComment('');
        setCommentRating(5);
        setShowNotification('Comentario agregado exitosamente');
        setTimeout(() => setShowNotification(''), 3000);
    };

    const getProductComments = () => {
        const productComments = comments[selectedProduct?.id] || [];
        return [...productComments].sort((a, b) => b.id - a.id);
    };

    const getSimilarProducts = () => {
        if (!selectedProduct) return [];
        return products
            .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
            .slice(0, 4);
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

    if (!selectedProduct) return <div className="loading">Cargando producto...</div>;

    return (
        <div className="product-page-container">
            {showNotification && (
                <div className="notification">
                    ✓ {showNotification}
                </div>
            )}

            <div className="product-page-content">
                <button className="back-btn" onClick={() => navigate(-1)}>← Volver</button>

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

                            {selectedProduct.images.length > 1 && (
                                <div className="image-page-indicator">
                                    {currentImageIndex + 1} / {selectedProduct.images.length}
                                </div>
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

                        {/* Listado de comentarios movido aquí */}
                        <div className="comments-section-list">
                            <h3>💬 Comentarios y Reseñas</h3>
                            <div className="comments-list">
                                {getProductComments().length > 0 ? (
                                    getProductComments().map((comment) => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-header">
                                                <strong>{comment.author}</strong>
                                                <span className="comment-rating">{'⭐'.repeat(comment.rating)}</span>
                                            </div>
                                            <p className="comment-text">{comment.text}</p>
                                            <span className="comment-date">{comment.date}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-comments">Sé el primero en comentar este producto</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h1 className="product-name">{selectedProduct.name}</h1>

                        <div className="product-meta">
                            <div className="rating">
                                <span className="stars">⭐</span>
                                <span className="rating-value">{selectedProduct.rating}</span>
                            </div>
                            <div className="vendor">
                                Vendedor: <strong>{selectedProduct.vendor}</strong>
                            </div>
                        </div>

                        <div className="price-tag">
                            <span className="product-price">${selectedProduct.price}</span>
                        </div>

                        <div className="description-box">
                            <h3>Descripción</h3>
                            <p>{selectedProduct.fullDescription}</p>
                        </div>

                        <div className="category-tag">
                            Categoría: <strong>{selectedProduct.category}</strong>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="add-to-cart-btn"
                                onClick={() => {
                                    addToCart(selectedProduct);
                                    setShowNotification(`${selectedProduct.name} agregado al carrito`);
                                    setTimeout(() => setShowNotification(''), 3000);
                                }}
                            >
                                ➕ Agregar al Carrito
                            </button>
                        </div>

                        {/* Formulario de comentarios se queda aquí */}
                        <div className="comments-form-section">
                            <h3>💬 Deja tu comentario, reseña y una calificación</h3>

                            <div className="comment-form">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Comparte tu opinión de este producto..."
                                    className="comment-input"
                                />
                                <div className="comment-controls">
                                    <div className="rating-selector">
                                        <label>Calificación:</label>
                                        <select
                                            value={commentRating}
                                            onChange={(e) => setCommentRating(Number(e.target.value))}
                                            className="rating-input"
                                        >
                                            <option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
                                            <option value={4}>⭐⭐⭐⭐ Muy Bueno</option>
                                            <option value={3}>⭐⭐⭐ Bueno</option>
                                            <option value={2}>⭐⭐ Regular</option>
                                            <option value={1}>⭐ Malo</option>
                                        </select>
                                    </div>
                                    <button
                                        className="comment-submit-btn"
                                        onClick={handleAddComment}
                                    >
                                        Enviar Comentario
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Productos Similares */}
                        {getSimilarProducts().length > 0 && (
                            <div className="similar-products-section">
                                <h3>🔍 Productos Similares</h3>
                                <div className="similar-products-grid">
                                    {getSimilarProducts().map((product) => (
                                        <div
                                            key={product.id}
                                            className="similar-product-card"
                                            onClick={() => {
                                                navigate(`/product/${product.id}`);
                                                setCurrentImageIndex(0);
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            <div className="similar-image">
                                                <img src={product.images[0]} alt={product.name} />
                                            </div>
                                            <div className="similar-info">
                                                <p className="similar-name">{product.name}</p>
                                                <p className="similar-price">${product.price}</p>
                                                <span className="similar-rating">⭐ {product.rating}</span>
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
    );
};

export default PageViewProduct;
