import React, { useState, useEffect } from 'react';
import './pagePay.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import DivPromo from '../divPromo/divPromo';

const getItemId = (item) => item._id || item.id;

const PagePay = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart, addToCart } = useCart();

    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await api.get('/products');
                if (response.data.success) {
                    setAllProducts(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchAllProducts();
    }, []);

    const handlePromoAddToCart = (product) => {
        const discountedProduct = {
            ...product,
            originalPrice: product.price,
            price: Math.floor(product.price * 0.90),
            isPromo: true
        };
        addToCart(discountedProduct);
    };

    // Estado para items seleccionados
    const [selectedItems, setSelectedItems] = useState({});

    // Inicializar selección (todos seleccionados al cargar)
    useEffect(() => {
        const initial = {};
        cartItems.forEach(item => {
            initial[getItemId(item)] = true;
        });
        setSelectedItems(initial);
    }, [cartItems.length]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Cálculos
    const selectedCount = cartItems.filter(item => selectedItems[getItemId(item)]).length;
    const isAllSelected = cartItems.length > 0 && selectedCount === cartItems.length;

    const selectedSubtotal = cartItems.reduce((acc, item) => {
        return selectedItems[getItemId(item)] ? acc + (item.price * item.quantity) : acc;
    }, 0);

    const toggleSelection = (id) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

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

    const handleRemove = (id) => {
        removeFromCart(id);
        const newSelected = { ...selectedItems };
        delete newSelected[id];
        setSelectedItems(newSelected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCount === 0) {
            alert('Por favor selecciona al menos un producto');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentSuccess(true);
            clearCart();
        }, 2000);
    };

    if (paymentSuccess) {
        return (
            <div className="pay-container success-view">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h1>¡Pedido Realizado!</h1>
                    <p>Gracias por tu compra. Te contactaremos pronto.</p>
                    <button className="back-home-btn" onClick={() => navigate('/')}>Volver a la tienda</button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="pay-container empty-view">
                <div className="empty-card">
                    <h1>Tu carrito está vacío</h1>
                    <p>Agrega productos para comenzar tu compra.</p>
                    <button className="back-home-btn" onClick={() => navigate('/')}>Explorar productos</button>
                </div>
            </div>
        );
    }

    return (
        <div className="pay-container">
            <DivPromo products={allProducts} handlePromoAddToCart={handlePromoAddToCart} />

            {/* Header / Breadcrumbs */}
            <div className="pay-header-simple">
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')}>Inicio</span> &gt; <span>Carrito</span>
                </div>
            </div>

            <div className="pay-main-content">
                {/* Lado Izquierdo: Lista de Productos */}
                <div className="products-column">
                    <div className="selection-bar">
                        <div className="select-all-group" onClick={toggleSelectAll}>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                readOnly
                            />
                            <span>Seleccionar todo ({cartItems.length})</span>
                        </div>
                        <div className="selection-stats">
                            <span>Sugeridos ({cartItems.length})</span>
                            <span className="selected-active">Seleccionado ({selectedCount})</span>
                        </div>
                    </div>

                    <div className="checkout-items-list">
                        {cartItems.map(item => (
                            <div key={getItemId(item)} className={`checkout-item-row ${!selectedItems[getItemId(item)] ? 'dimmed' : ''}`}>
                                <div className="item-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems[getItemId(item)]}
                                        onChange={() => toggleSelection(getItemId(item))}
                                    />
                                </div>

                                <div className="item-main-info">
                                    <div className="item-image-box">
                                        <img src={item.images[0]} alt={item.name} />
                                    </div>
                                    <div className="item-details-box">
                                        <h4 className="item-name-checkout">{item.name}</h4>
                                        <p className="item-vendor-checkout">Nexora Premium</p>
                                        <div className="item-pricing-row">
                                            {item.originalPrice ? (
                                                <>
                                                    <div className="price-stack-checkout">
                                                        <span className="old-price-checkout">₡ {item.originalPrice.toLocaleString()}</span>
                                                        <div className="current-price-row">
                                                            <span className="current-price">₡ {item.price.toLocaleString()}</span>
                                                            <span className="discount-badge-checkout">
                                                                -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="current-price">₡ {item.price.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="item-actions-box">
                                    <button className="delete-item-btn" onClick={() => handleRemove(getItemId(item))}>🗑️</button>
                                    <div className="quantity-selector-checkout">
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
                <aside className="summary-sidebar">
                    <div className="sticky-summary-card">
                        <h3>Resumen del pedido</h3>

                        <div className="summary-details">
                            <div className="detail-line">
                                <span>Total de artículos:</span>
                                <span>${selectedSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="detail-line shipping">
                                <span>Envío:</span>
                                <span>GRATIS</span>
                            </div>
                        </div>

                        <div className="summary-total-final">
                            <div className="total-label-row">
                                <strong>Total</strong>
                                <span className="total-amount-large">${selectedSubtotal.toFixed(2)}</span>
                            </div>
                            <p className="tax-hint">Consulta el monto final al completar el pago.</p>
                        </div>

                        <button
                            className="order-submit-btn-temu"
                            disabled={isProcessing || selectedCount === 0}
                            onClick={handleSubmit}
                        >
                            {isProcessing ? 'Procesando...' : `Hacer pedido (${selectedCount})`}
                        </button>

                        <div className="payment-trust-section">
                            <p className="secure-payment-text">🛡️ Opciones de pago seguro</p>
                            <div className="payment-methods-grid">
                                <span>VISA</span>
                                <span>MasterCard</span>
                                <span>PayPal</span>
                                <span>Apple Pay</span>
                            </div>
                            <p className="trust-disclaimer">
                                Nexora se compromete a proteger tu información de pago.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PagePay;
