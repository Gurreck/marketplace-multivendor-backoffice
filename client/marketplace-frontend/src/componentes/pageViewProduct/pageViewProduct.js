import React, { useState, useEffect, useCallback } from 'react';
import './pageViewProduct.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import ModalLogin from '../Modal/ModalLogin';
import Reseña from '../Reseña/Reseña';
import { commentService } from '../../services/commentService';

import { 
    ChevronLeft, 
    ChevronRight, 
    Star,
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
    const [loadingComments, setLoadingComments] = useState(true);


    // ===== ESTADO DE UI =====
    const [showNotification, setShowNotification] = useState(''); // Mensaje de notificación temporal
    const [showLoginModal, setShowLoginModal] = useState(false); // Control del modal de login sugerido

    const fetchComments = useCallback(async () => {
        try {
            setLoadingComments(true);
            const response = await commentService.getCommentsByProduct(id);
            if (response.data.success) {
                setComments(response.data.data);
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

                        {/* Stock Indicator */}
                        {selectedProduct.stock !== undefined && (
                            <div style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '12px',
                                ...(selectedProduct.stock <= 5
                                    ? { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
                                    : selectedProduct.stock <= 20
                                    ? { background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
                                    : { background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' })
                            }}>
                                {selectedProduct.stock <= 5
                                    ? `¡Solo quedan ${selectedProduct.stock} unidades! 🔥`
                                    : selectedProduct.stock <= 20
                                    ? `${selectedProduct.stock} unidades disponibles`
                                    : `En stock (${selectedProduct.stock} disponibles)`}
                            </div>
                        )}

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

                    </div>
                </div>

                <div className="contenedor-inferior-detalles">
                    {/* Sección de Reseñas (Lado Izquierdo) */}
                    <div className="seccion-reseñas-producto">
                        <h3><Star size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Opiniones de Clientes</h3>
                        <div className="lista-reseñas-estilizada">
                            {loadingComments ? (
                                <div className="cargando-reseñas">
                                    <Loader2 className="animacion-giro" size={24} />
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="sin-comentarios">No hay reseñas para este producto aún.</p>
                            ) : (
                                comments.slice(0, 5).map((reseña) => (
                                    <Reseña 
                                        key={reseña._id}
                                        user={reseña.user?.nombre}
                                        rating={reseña.rating}
                                        comment={reseña.text}
                                        date={new Date(reseña.createdAt).toLocaleDateString()}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sección de Productos Similares (Lado Derecho) */}
                    {similarProducts.length > 0 && (
                        <div className="seccion-productos-similares">
                            <h3><Search size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Similares</h3>
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
        </>
    );
};

export default PageViewProduct;
