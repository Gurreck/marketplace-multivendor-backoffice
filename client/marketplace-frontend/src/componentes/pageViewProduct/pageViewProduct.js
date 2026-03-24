import React, { useState, useEffect, useCallback } from 'react';
import './pageViewProduct.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { commentService } from '../../services/commentService';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import ModalLogin from '../Modal/ModalLogin';
import { 
    ChevronLeft, 
    ChevronRight, 
    MessageCircle, 
    Star, 
    Send, 
    Plus, 
    Search, 
    CheckCircle2, 
    Loader2,
    Tag,
    User,
    ArrowLeft
} from 'lucide-react';

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

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);

    const [comments, setComments] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loadingComments, setLoadingComments] = useState(true);

    const [newComment, setNewComment] = useState(""); // Texto del nuevo comentario a publicar
    const [newRating, setNewRating] = useState(5); // Calificación del nuevo comentario (1-5)

    // ===== ESTADO DE UI =====
    const [showNotification, setShowNotification] = useState(''); // Mensaje de notificación temporal
    const [showLoginModal, setShowLoginModal] = useState(false); // Control del modal de login sugerido

    // Función para cargar comentarios desde el backend
    const fetchComments = useCallback(async () => {
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
    }, [id]);

    const fetchSimilarProducts = useCallback(async (category, currentId) => {
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                const filtered = response.data.data.filter(p => p.category === category && p._id !== currentId);
                setSimilarProducts(filtered.slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    }, []);

    const fetchProductDetail = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            if (response.data.success) {
                setSelectedProduct(response.data.data);
                fetchSimilarProducts(response.data.data.category, response.data.data._id);
            }
        } catch (error) {
            console.error('Error fetching product detail:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, fetchSimilarProducts]);

    useEffect(() => {
        fetchProductDetail();
        fetchComments();
    }, [fetchProductDetail, fetchComments]);

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
                fetchComments();
                setShowNotification("Comentario publicado exitosamente");
                setTimeout(() => setShowNotification(""), 3000);
            }
        } catch (error) {
            console.error("Error creating comment:", error);
            setShowNotification("Error al publicar comentario");
            setTimeout(() => setShowNotification(""), 3000);
        }
    };

    // ===== RENDERIZADO CONDICIONAL (CARGA) =====
    if (loading) return (
        <div className="loading" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0094FF', gap: '15px' }}>
            <Loader2 className="animacion-giro" size={48} />
            <p style={{ fontSize: '20px', fontWeight: '500' }}>Cargando producto...</p>
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
                        <CheckCircle2 size={18} style={{ marginRight: '8px' }} />
                        {showNotification}
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
                                    <button className="boton-navegacion-imagen prev" onClick={goToPreviousImage}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button className="boton-navegacion-imagen next" onClick={goToNextImage}>
                                        <ChevronRight size={24} />
                                    </button>
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

                        <div className="seccion-comentarios">
                            <div className="encabezado-comentarios">
                                <h3><MessageCircle size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Opiniones de Clientes</h3>
                                <div className="resumen-calificacion">
                                    <span className="numero-calificacion">{averageRating || "0"}</span>
                                    <div className="estrellas-calificacion">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={16} 
                                                fill={i < Math.round(averageRating || 0) ? "var(--admin-advertencia)" : "none"} 
                                                color={i < Math.round(averageRating || 0) ? "var(--admin-advertencia)" : "#ccc"} 
                                            />
                                        ))}
                                    </div>
                                    <span className="conteo-calificacion">({comments.length} comentarios)</span>
                                </div>
                            </div>

                            <div className="formulario-comentario">
                                <div className="seleccion-calificacion">
                                    <label>Tu calificación:</label>
                                    <div className="entrada-estrellas">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star}
                                                size={24}
                                                className={star <= newRating ? "estrella activo" : "estrella"}
                                                onClick={() => setNewRating(star)}
                                                fill={star <= newRating ? "var(--admin-advertencia)" : "none"}
                                                color={star <= newRating ? "var(--admin-advertencia)" : "#ccc"}
                                                style={{ cursor: 'pointer' }}
                                            />
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
                                    <Send size={16} style={{ marginRight: '8px' }} />
                                    Publicar Comentario
                                </button>
                            </div>

                            <div className="lista-comentarios">
                                {loadingComments ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <Loader2 className="animacion-giro" size={24} color="var(--nexora-blue)" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <p style={{textAlign: 'center', color: 'var(--nexora-text-secondary)', padding: '20px'}}>Aún no hay comentarios. ¡Sé el primero en opinar!</p>
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
                                                        <Star 
                                                            key={i} 
                                                            size={14} 
                                                            fill={i < comment.rating ? "var(--admin-advertencia)" : "none"}
                                                            color={i < comment.rating ? "var(--admin-advertencia)" : "#ccc"}
                                                        />
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
                        <div className="navegacion-atras">
                            <button onClick={() => navigate(-1)} className="boton-atras">
                                <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Volver
                            </button>
                        </div>
                        
                        <h1 className="nombre-producto">{selectedProduct.name}</h1>

                        <div className="caja-descripcion">
                            <h3>Descripción</h3>
                            <p>{selectedProduct.description}</p>
                        </div>

                        <div className="etiqueta-categoria">
                            <Tag size={16} style={{ marginRight: '8px' }} />
                            Categoría: <strong>{selectedProduct.category}</strong>
                        </div>

                        <div className="meta-producto">
                            <div className="vendedor">
                                <User size={16} style={{ marginRight: '8px' }} />
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
                                <Plus size={20} style={{ marginRight: '10px' }} />
                                Agregar al Carrito
                            </button>
                        </div>

                        {similarProducts.length > 0 && (
                            <div className="seccion-productos-similares">
                                <h3><Search size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Productos Similares</h3>
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
