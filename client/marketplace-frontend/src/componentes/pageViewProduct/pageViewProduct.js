import React, { useState, useEffect } from 'react';
import './pageViewProduct.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { commentService } from '../../services/commentService';
import { orderService } from '../../services/orderService';

import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import ModalLogin from '../Modal/ModalLogin';

/**
 * PageViewProduct
 * Componente que muestra el detalle completo de un producto, incluyendo carrusel de imágenes,
 * descripción, precio, vendedor, productos similares y sistema de reseñas.
 */
const PageViewProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
 
    // ===== CONTEXTO =====
    const { user, isAuthenticated, logout } = useAuth();
    const { addToCart, cartCount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();

    // ===== ESTADO DEL PRODUCTO =====
    const [selectedProduct, setSelectedProduct] = useState(null); // Datos del producto actual
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Índice de la imagen visible en el carrusel
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [similarProducts, setSimilarProducts] = useState([]); // Lista de productos de la misma categoría

    // ===== ESTADO DE COMENTARIOS =====
    const [comments, setComments] = useState([]); // Lista de reseñas del producto
    const [averageRating, setAverageRating] = useState(0); // Promedio de calificación (0-5)
    const [loadingComments, setLoadingComments] = useState(true); // Carga específica de comentarios
    const [hasPurchased, setHasPurchased] = useState(false); // Verifica si el usuario ha comprado el producto

    const [newComment, setNewComment] = useState(""); // Texto del nuevo comentario a publicar
    const [newRating, setNewRating] = useState(5); // Calificación del nuevo comentario (1-5)

    // ===== ESTADO DE UI =====
    const [showNotification, setShowNotification] = useState(''); // Mensaje de notificación temporal
    const [showLoginModal, setShowLoginModal] = useState(false); // Control del modal de login sugerido

    // ===== EFECTOS =====
    /**
     * Carga el detalle del producto y sus comentarios cada vez que el ID en la URL cambia
     */
    useEffect(() => {
        fetchProductDetail();
        fetchComments();
        checkPurchase();
    }, [id, isAuthenticated]);

    // ===== CARGA DE DATOS =====
    /**
     * Obtiene los comentarios y el promedio de calificación desde el backend
     */
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

    /**
     * Verifica si el usuario ha comprado el producto
     */
    const checkPurchase = async () => {
        if (!isAuthenticated) {
            setHasPurchased(false);
            return;
        }
        
        try {
            const response = await orderService.verifyPurchase(id);
            if (response.data.success) {
                setHasPurchased(response.data.hasPurchased);
            }
        } catch (error) {
            console.error("Error verifying purchase:", error);
            setHasPurchased(false);
        }
    };

    /**
     * Obtiene la información detallada del producto por su ID
     */
    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            if (response.data.success) {
                setSelectedProduct(response.data.data);
                // Una vez cargado el producto, busca otros similares de la misma categoría
                fetchSimilarProducts(response.data.data.category, response.data.data._id);
            }
        } catch (error) {
            console.error('Error fetching product detail:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Obtiene productos de la misma categoría excluyendo el actual
     */
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

    // ===== MANEJADORES DE IMÁGENES =====
    /**
     * Cambia a la imagen anterior en el carrusel
     */
    const goToPreviousImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? selectedProduct.images.length - 1 : prev - 1
        );
    };

    /**
     * Cambia a la siguiente imagen en el carrusel
     */
    const goToNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === selectedProduct.images.length - 1 ? 0 : prev + 1
        );
    };

    // ===== MANEJADORES DE COMENTARIOS =====
    /**
     * Valida y envía una nueva reseña al backend
     */
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
                fetchComments(); // Recargar la lista actualizada
                setShowNotification("Comentario publicado exitosamente");
                setTimeout(() => setShowNotification(""), 3000);
            }
        } catch (error) {
            console.error("Error creating comment:", error);
            const errorMessage = error.response?.data?.message || "Error al publicar comentario";
            setShowNotification(errorMessage);
            setTimeout(() => setShowNotification(""), 3000);
        }
    };

    // ===== RENDERIZADO CONDICIONAL (CARGA) =====
    if (loading) return (
        <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0094FF', fontSize: '24px' }}>
            Cargando producto...
        </div>
    );

    if (!selectedProduct) return null;

    // ===== RENDERIZADO PRINCIPAL =====
    return (
        <>
            {/* Modal de Login Sugerido */}
            <ModalLogin 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)}
                onLogin={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                }}
                mensaje="Debes iniciar sesión para realizar esta acción"
            />

            <div className={`barra-navegacion-secundaria ${!isDarkMode ? 'modo-claro' : ''}`}>
                <NavbarSecundario
                    toggleTheme={toggleTheme}
                    isDarkMode={isDarkMode}
                    user={user}
                    logout={logout}
                    cartCount={cartCount}
                />
            </div>

            <div className={`contenedor-pagina-producto ${!isDarkMode ? 'modo-claro' : ''}`}>
                {/* Notificación flotante */}
                {showNotification && (
                    <div className="notificacion">
                        ✓ {showNotification}
                    </div>
                )}

            <div className="contenido-pagina-producto">
                <div className="diseno-contenido-principal">
                    {/* Columna Izquierda: Galería y Comentarios */}
                    <div className="seccion-imagen">
                        <div className="contenedor-imagen-principal">
                            <img
                                src={selectedProduct.images[currentImageIndex]?.url || "https://via.placeholder.com/600"}
                                alt={selectedProduct.name}
                                className="imagen-principal-producto"
                            />

                            {/* Controles de navegación de imagen */}
                            {selectedProduct.images.length > 1 && (
                                <>
                                    <button className="boton-navegacion-imagen prev" onClick={goToPreviousImage}>◀</button>
                                    <button className="boton-navegacion-imagen next" onClick={goToNextImage}>▶</button>
                                </>
                            )}
                        </div>

                        {/* Miniaturas de la galería */}
                        {selectedProduct.images.length > 1 && (
                            <div className="miniaturas-imagenes">
                                {selectedProduct.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`miniatura ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <img src={image.url || "https://via.placeholder.com/120"} alt={`Vista ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SECCIÓN DE COMENTARIOS */}
                        <div className="seccion-comentarios">
                            <div className="encabezado-comentarios">
                                <h3>💬 Opiniones de Clientes</h3>
                                <div className="resumen-calificacion">
                                    <span className="numero-calificacion">{averageRating || "0"}</span>
                                    <div className="estrellas-calificacion">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < Math.round(averageRating || 0) ? "estrella llena" : "estrella"}>★</span>
                                        ))}
                                    </div>
                                    <span className="conteo-calificacion">({comments.length} comentarios)</span>
                                </div>
                            </div>

                            {/* Formulario de Nueva Reseña - Solo visible si el usuario ha comprado el producto */}
                            {hasPurchased ? (
                                <div className="formulario-comentario">
                                    <div className="seleccion-calificacion">
                                        <label>Tu calificación:</label>
                                        <div className="entrada-estrellas">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span 
                                                    key={star}
                                                    className={star <= newRating ? "estrella activo" : "estrella"}
                                                    onClick={() => setNewRating(star)}
                                                >
                                                    ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    className="entrada-comentario"
                                    placeholder="Escribe tu opinión sobre el producto..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button className="boton-enviar-comentario" onClick={handleSubmitComment}>
                                    Publicar Comentario
                                </button>
                            </div>
                            ) : (
                                <div className="formulario-comentario" style={{textAlign: 'center', padding: '20px', background: 'var(--nexora-bg-secondary)', borderRadius: '8px', marginBottom: '20px'}}>
                                    <p style={{color: 'var(--nexora-text-secondary)'}}>🔒 Solo los clientes que han comprado este producto pueden dejar una opinión.</p>
                                </div>
                            )}

                            {/* Lista de Reseñas cargadas */}
                            <div className="lista-comentarios">
                                {loadingComments ? (
                                    <p style={{textAlign: 'center', color: 'var(--nexora-text-secondary)'}}>Cargando comentarios...</p>
                                ) : comments.length === 0 ? (
                                    <p style={{textAlign: 'center', color: 'var(--nexora-text-secondary)'}}>Aún no hay comentarios</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment._id} className="item-comentario">
                                            <div className="encabezado-comentario">
                                                <img 
                                                    src={`https://i.pravatar.cc/150?img=${comment.user?.nombre ? comment.user.nombre.charCodeAt(0) % 70 : 1}`} 
                                                    alt={comment.user?.nombre || "Usuario"} 
                                                    className="avatar-comentario" 
                                                />
                                                <div className="informacion-comentario">
                                                    <span className="usuario-comentario">{comment.user?.nombre || "Usuario"}</span>
                                                    <span className="fecha-comentario">{new Date(comment.createdAt).toLocaleDateString("es-CR")}</span>
                                                </div>
                                                <div className="calificacion-comentario">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < comment.rating ? "estrella llena" : "estrella"}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="texto-comentario">{comment.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Información y Acciones */}
                    <div className="seccion-informacion">
                        <h1 className="nombre-producto">{selectedProduct.name}</h1>

                        <div className="caja-descripcion">
                            <h3>Descripción</h3>
                            <p>{selectedProduct.description}</p>
                        </div>

                        <div className="etiqueta-categoria">
                            Categoría: <strong>{selectedProduct.category}</strong>
                        </div>

                        <div className="meta-producto">
                            <div className="vendedor">
                                Vendedor: <strong>{selectedProduct.vendor?.nombre || selectedProduct.vendor}</strong>
                            </div>
                        </div>

                        <div className="etiqueta-precio">
                            <span className="precio-producto"> ₡ {selectedProduct.price.toLocaleString()}</span>
                        </div>

                        <div className="botones-accion">
                            <button
                                className="boton-agregar-carrito"
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

                        {/* Carrusel de Productos Similares */}
                        {similarProducts.length > 0 && (
                            <div className="seccion-productos-similares">
                                <h3>🔍 Productos Similares</h3>
                                <div className="cuadricula-productos-similares">
                                    {similarProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className="tarjeta-producto-similar"
                                            onClick={() => {
                                                navigate(`/product/${product._id}`);
                                                setCurrentImageIndex(0);
                                                window.scrollTo(0, 0);
                                            }}
                                            title={product.name}
                                        >
                                            <div className="imagen-similar">
                                                <img src={product.images[0]?.url || "https://via.placeholder.com/120"} alt={product.name} />
                                            </div>
                                            <div className="informacion-similar">
                                                <p className="nombre-similar">{product.name}</p>
                                                <p className="precio-similar">₡{product.price.toLocaleString()}</p>
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
