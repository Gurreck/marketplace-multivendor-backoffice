import React, { useState, useEffect, useCallback } from 'react';
import './VistaProducto.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import ModalLogin from '../Modal/ModalLogin/ModalLogin';
import ModalPerfilVendedor from '../Modal/ModalPerfilVendedor/ModalPerfilVendedor';
import Reseña from '../Reseña/Reseña';
import { commentService } from '../../services/commentService';

import ProductoInfo from '../ProductoInfo/ProductoInfo';
import ProductoGaleria from '../ProductoGaleria/ProductoGaleria';
import { 
    ChevronLeft, 
    ChevronRight, 
    Star,
    Search, 
    CheckCircle2, 
    Loader2,
} from 'lucide-react';

/**
 * VistaProducto
 * Componente que muestra el detalle completo de un producto.
 */
const VistaProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
 
    const { user, isAuthenticated, logout } = useAuth();
    const { addToCart, cartCount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [showNotification, setShowNotification] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            setLoadingComments(true);
            const response = await commentService.getCommentsByProduct(id);
            if (response.data.success) setComments(response.data.data);
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

    const handleAddToCart = () => {
        if (!isAuthenticated) { setShowLoginModal(true); return; }
        addToCart(selectedProduct);
        setShowNotification(`${selectedProduct.name} agregado al carrito`);
        setTimeout(() => setShowNotification(''), 3000);
    };

    if (loading) return (
        <div className="loading" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0094FF', gap: '15px' }}>
            <Loader2 className="animacion-giro" size={48} />
            <p style={{ fontSize: '20px', fontWeight: '500' }}>Cargando producto...</p>
        </div>
    );

    if (!selectedProduct) return null;

    return (
        <>
            <ModalLogin 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)}
                onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
                mensaje="Debes iniciar sesión para realizar esta acción"
            />
            <ModalPerfilVendedor
                isOpen={showVendorModal}
                onClose={() => setShowVendorModal(false)}
                vendor={selectedProduct.vendor}
            />
            <div className={`barra-navegacion-secundaria ${!isDarkMode ? 'modo-claro' : ''}`}>
                <NavbarSecundario toggleTheme={toggleTheme} isDarkMode={isDarkMode} user={user} logout={logout} cartCount={cartCount} />
            </div>
            <div className={`contenedor-pagina-producto ${!isDarkMode ? 'modo-claro' : ''}`}>
                {showNotification && (
                    <div className="notificacion">
                        <CheckCircle2 size={18} style={{ marginRight: '8px' }} />
                        {showNotification}
                    </div>
                )}
                <div className="contenido-pagina-producto">
                    <div className="diseno-contenido-principal">
                        {/* Galería */}
                        <ProductoGaleria 
                            images={selectedProduct.images} 
                            currentImageIndex={currentImageIndex} 
                            setCurrentImageIndex={setCurrentImageIndex} 
                            goToPreviousImage={goToPreviousImage} 
                            goToNextImage={goToNextImage} 
                        />

                        {/* Información del Producto */}
                        <ProductoInfo
                            product={selectedProduct}
                            onAddToCart={handleAddToCart}
                            onShowVendorModal={() => setShowVendorModal(true)}
                        />
                    </div>

                    <div className="contenedor-inferior-detalles">
                        {/* Reseñas */}
                        <div className="seccion-reseñas-producto">
                            <h3><Star size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Opiniones de Clientes</h3>
                            <div className="lista-reseñas-estilizada">
                                {loadingComments ? (
                                    <div className="cargando-reseñas"><Loader2 className="animacion-giro" size={24} /></div>
                                ) : comments.length === 0 ? (
                                    <p className="sin-comentarios">No hay reseñas para este producto aún.</p>
                                ) : (
                                    comments.slice(0, 5).map((reseña) => (
                                        <Reseña key={reseña._id} user={reseña.user?.nombre} rating={reseña.rating} comment={reseña.text} date={new Date(reseña.createdAt).toLocaleDateString()} />
                                    ))
                                )}
                            </div>
                        </div>
                        {/* Productos Similares */}
                        {similarProducts.length > 0 && (
                            <div className="seccion-productos-similares">
                                <h3><Search size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Similares</h3>
                                <div className="cuadricula-productos-similares">
                                    {similarProducts.map((product) => (
                                        <div key={product._id} className="tarjeta-producto-similar" onClick={() => { navigate(`/product/${product._id}`); setCurrentImageIndex(0); window.scrollTo(0, 0); }} title={product.name}>
                                            <div className="imagen-similar"><img src={product.images[0]?.url || "https://via.placeholder.com/120"} alt={product.name} /></div>
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

export default VistaProducto;
