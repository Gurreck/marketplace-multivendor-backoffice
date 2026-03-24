import React, { useState, useEffect } from 'react';
import './pagePay.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { commentService } from '../../services/commentService';

import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';

const getItemId = (item) => item._id || item.id;

const PagePay = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart, addToCart, cartCount } = useCart();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    // ===== ESTADO =====
    const [productComments, setProductComments] = useState({}); // Comentarios por producto
    const [loadingComments, setLoadingComments] = useState(true); // Estado de carga de comentarios
    const [paymentSuccess, setPaymentSuccess] = useState(false); // Estado de éxito del pago
    const [selectedItems, setSelectedItems] = useState({}); // Items seleccionados en el carrito
    // ===== NAVEGACIÓN Y PAGOS =====
    /**
     * Redirige a la pasarela de pago con los productos seleccionados
     */
    const handleProceedToPayment = () => {
        if (selectedCount === 0) {
            alert('Por favor selecciona al menos un producto');
            return;
        }

        // Filtrar solo los items seleccionados
        const selectedCartItems = cartItems.filter(item => selectedItems[getItemId(item)]);

        // Navegar a la pasarela de pago con los datos del carrito
        navigate('/paymentGateway', {
            state: {
                selectedItems: selectedCartItems,
                selectedSubtotal: selectedSubtotal,
                selectedCount: selectedCount
            }
        });
    };

    // ===== EFECTOS Y CARGA DE DATOS =====
    /**
     * Inicializa la selección marcando todos los productos del carrito por defecto
     */
    useEffect(() => {
        const initial = {};
        cartItems.forEach(item => {
            initial[getItemId(item)] = true;
        });
        setSelectedItems(initial);
    }, [cartItems.length]);

    /**
     * Obtiene los comentarios y calificación de un producto específico
     */
    const fetchProductComments = async (productId) => {
        try {
            const response = await commentService.getCommentsByProduct(productId);
            if (response.data.success) {
                return {
                    averageRating: response.data.averageRating,
                    count: response.data.count
                };
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
        return { averageRating: 0, count: 0 };
    };

    /**
     * Carga de forma asíncrona todos los comentarios de los productos presentes en el carrito
     */
    useEffect(() => {
        const loadAllComments = async () => {
            if (cartItems.length === 0) {
                setLoadingComments(false);
                return;
            }
            
            setLoadingComments(true);
            const commentsData = {};
            
            for (const item of cartItems) {
                const productId = item._id || item.id;
                commentsData[productId] = await fetchProductComments(productId);
            }
            
            setProductComments(commentsData);
            setLoadingComments(false);
        };
        
        loadAllComments();
    }, [cartItems.length]);

    // ===== ACCIONES DEL CARRITO =====
    /**
     * Alterna la selección de un item individual
     */
    const toggleSelection = (id) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /**
     * Alterna entre seleccionar todos los items o ninguno
     */
    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems({});
        } else {
            const allSelected = {};
            cartItems.forEach(item => {
                allSelected[getItemId(item)] = true;
            });
            setSelectedItems(allSelected);
        }
    };

    /**
     * Remueve un item del carrito y de la lista de seleccionados
     */
    const handleRemove = (id) => {
        removeFromCart(id);
        const newSelected = { ...selectedItems };
        delete newSelected[id];
        setSelectedItems(newSelected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleProceedToPayment();
    };

    // ===== LÓGICA DE CÁLCULO =====
    const selectedCount = cartItems.filter(item => selectedItems[getItemId(item)]).length;
    const isAllSelected = cartItems.length > 0 && selectedCount === cartItems.length;

    const selectedSubtotal = cartItems.reduce((acc, item) => {
        return selectedItems[getItemId(item)] ? acc + (item.price * item.quantity) : acc;
    }, 0);

    // ===== RENDERIZADO PRINCIPAL =====

    if (paymentSuccess) {
        return (
            <div className="contenedor-pago vista-exito">
                <div className="tarjeta-exito">
                    <div className="icono-exito">✓</div>
                    <h1>¡Pedido Realizado!</h1>
                    <p>Gracias por tu compra. Te contactaremos pronto.</p>
                    <button className="boton-volver-inicio" onClick={() => navigate('/')}>Volver a la tienda</button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="contenedor-pago vista-vacia">
                <div className="tarjeta-vacia">
                    <h1>Tu carrito está vacío</h1>
                    <p>Agrega productos para comenzar tu compra.</p>
                    <button className="boton-volver-inicio" onClick={() => navigate('/')}>Explorar productos</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`barra-navegacion-secundaria ${!isDarkMode ? 'modo-claro' : ''}`}>
                <NavbarSecundario
                    toggleTheme={toggleTheme}
                    isDarkMode={isDarkMode}
                    user={user}
                    logout={logout}
                    cartCount={cartCount}
                />
            </div>

            <div className={`contenedor-pago ${!isDarkMode ? 'modo-claro' : ''}`}>
                {/* <DivPromo products={allProducts} handlePromoAddToCart={handlePromoAddToCart} /> */}


                {/* Header / Breadcrumbs */}
                <div className="encabezado-pago-simple">
                    <div className="migas-pan">
                        <span onClick={() => navigate('/')}>Inicio</span> &gt; <span>Carrito</span>
                    </div>
                </div>

                <div className="contenido-principal-pago">
                    {/* Lado Izquierdo: Lista de Productos */}
                    <div className="columna-productos">
                        <div className="barra-seleccion">
                            <div className="grupo-seleccionar-todo" onClick={toggleSelectAll}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    readOnly
                                />
                                <span>Seleccionar todo ({cartItems.length})</span>
                            </div>
                            <div className="estadisticas-seleccion">
                                <span>Sugeridos ({cartItems.length})</span>
                                <span className="seleccion-activa">Seleccionado ({selectedCount})</span>
                            </div>
                        </div>

                        <div className="lista-items-pago">
                            {cartItems.map(item => (
                                <div key={getItemId(item)} className={`fila-item-pago ${!selectedItems[getItemId(item)] ? 'atenuado' : ''}`}>
                                    <div className="casilla-item">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedItems[getItemId(item)]}
                                            onChange={() => toggleSelection(getItemId(item))}
                                        />
                                    </div>

                                    <div className="informacion-principal-item">
                                        <div className="caja-imagen-item">
                                            <img src={item.images[0]} alt={item.name} />
                                        </div>
                                        <div className="caja-detalles-item">
                                            <h4 className="nombre-item-pago">{item.name}</h4>
                                            
                                            {/* Sección de comentarios y rating del producto */}
                                            {loadingComments ? (
                                                <div className="cargando-calificacion-item">Cargando...</div>
                                            ) : productComments[item._id || item.id]?.count > 0 ? (
                                                <div className="seccion-calificacion-item">
                                                    <div className="estrellas-calificacion-item">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < Math.round(productComments[item._id || item.id]?.averageRating || 0) ? "estrella llena" : "estrella"}>★</span>
                                                        ))}
                                                    </div>
                                                    <span className="numero-calificacion-item">
                                                        {productComments[item._id || item.id]?.averageRating || "0"}
                                                    </span>
                                                    <span className="conteo-calificacion-item">
                                                        ({productComments[item._id || item.id]?.count || 0} opiniones)
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="item-sin-comentarios">
                                                    <span>⭐</span> Este producto aún no tiene comentarios
                                                </div>
                                            )}
                                            
                                            <p className="vendedor-item-pago">Nexora Premium</p>
                                            <div className="fila-precio-item">
                                                {item.originalPrice ? (
                                                    <>
                                                        <div className="pila-precio-pago">
                                                            <span className="precio-anterior-pago">₡ {item.originalPrice.toLocaleString()}</span>
                                                            <div className="fila-precio-actual">
                                                                <span className="precio-actual">₡ {item.price.toLocaleString()}</span>
                                                                <span className="etiqueta-descuento-pago">
                                                                    -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="precio-actual">₡ {item.price.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="caja-acciones-item">
                                        <button className="boton-eliminar-item" onClick={() => handleRemove(getItemId(item))}>🗑️</button>
                                        <div className="selector-cantidad-pago">
                                            <span>Cant. </span>
                                            <select
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(getItemId(item), parseInt(e.target.value))}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lado Derecho: Resumen Sticky */}
                    <aside className="barra-lateral-resumen">
                        <div className="tarjeta-resumen-fija">
                            <h3>Resumen del pedido</h3>

                            <div className="detalles-resumen">
                                <div className="linea-detalle">
                                    <span>Total de articulos:</span>
                                    <span>₡{selectedSubtotal.toLocaleString()}</span>
                                </div>
                                <div className="linea-detalle envio">
                                    <span>Envio:</span>
                                    <span>GRATIS</span>
                                </div>
                            </div>

                            <div className="total-final-resumen">
                                <div className="fila-etiqueta-total">
                                    <strong>Total</strong>
                                    <span className="monto-total-grande">₡{selectedSubtotal.toLocaleString()}</span>
                                </div>
                                <p className="nota-impuestos">Consulta el monto final al completar el pago.</p>
                            </div>

                            {/* Botón para proceder al pago */}
                            <button
                                className="boton-enviar-pedido"
                                disabled={selectedCount === 0}
                                onClick={handleProceedToPayment}
                            >
                                Proceder al Pago ({selectedCount})
                            </button>

                            <div className="seccion-confianza-pago">
                                <p className="texto-pago-seguro">🛡️ Pago seguro</p>

                                <p className="descargo-responsabilidad-confianza">
                                    Serás redirigido a una pagina segura para completar tu pago.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default PagePay;
