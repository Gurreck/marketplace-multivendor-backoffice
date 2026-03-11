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
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastFourDigits, setLastFourDigits] = useState('');

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

    // Validar número de tarjeta (debe iniciar con 4 o 5 y tener 16 dígitos)
    const validateCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        if (!cleanNumber.startsWith('5') && !cleanNumber.startsWith('4')) {
            return 'La tarjeta es invalida porfavor ingrese una tarjeta valida';
        }
        if (cleanNumber.length !== 16) {
            return 'El numero de tarjeta debe tener 16 digitos';
        }
        if (!/^[45]\d{15}$/.test(cleanNumber)) {
            return 'Numero de tarjeta invalido';
        }
        return null;
    };

    // Validar fecha de vencimiento (formato MM/YY y no vencida)
    const validateExpiryDate = (date) => {
        if (!/^\d{2}\/\d{2}$/.test(date)) {
            return 'Formato invalido. Use MM/AA';
        }
        const [month, year] = date.split('/').map(Number);
        if (month < 1 || month > 12) {
            return 'Mes invalido (01-12)';
        }
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return 'La tarjeta esta vencida';
        }
        return null;
    };

    // Validar CVV (3 dígitos)
    const validateCvv = (cvvCode) => {
        if (!/^\d{3}$/.test(cvvCode)) {
            return 'El CVV debe tener 3 digitos';
        }
        return null;
    };

    // Validar nombre del titular
    const validateCardName = (name) => {
        if (name.trim().length < 3) {
            return 'Ingrese el nombre del titular';
        }
        return null;
    };

    // Formatear número de tarjeta (agregar espacio cada 4 dígitos)
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    // Formatear fecha de vencimiento (MM/AA)
    const formatExpiryDateInput = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    // Manejar cambio en número de tarjeta
    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
        if (errors.cardNumber) {
            setErrors(prev => ({ ...prev, cardNumber: null }));
        }
    };

    // Manejar cambio en fecha de vencimiento
    const handleExpiryDateChange = (e) => {
        const formatted = formatExpiryDateInput(e.target.value);
        setExpiryDate(formatted);
        if (errors.expiryDate) {
            setErrors(prev => ({ ...prev, expiryDate: null }));
        }
    };

    // Manejar cambio en CVV
    const handleCvvChange = (e) => {
        const v = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
        setCvv(v);
        if (errors.cvv) {
            setErrors(prev => ({ ...prev, cvv: null }));
        }
    };

    // Manejar cambio en nombre
    const handleCardNameChange = (e) => {
        setCardName(e.target.value);
        if (errors.cardName) {
            setErrors(prev => ({ ...prev, cardName: null }));
        }
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

        // Validar todos los campos
        const newErrors = {};
        const cardError = validateCardNumber(cardNumber);
        const expiryError = validateExpiryDate(expiryDate);
        const cvvError = validateCvv(cvv);
        const nameError = validateCardName(cardName);

        if (cardError) newErrors.cardNumber = cardError;
        if (expiryError) newErrors.expiryDate = expiryError;
        if (cvvError) newErrors.cvv = cvvError;
        if (nameError) newErrors.cardName = nameError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Simulación de pasarela de pago
        setIsProcessing(true);
        setErrors({});
        
        // Simular procesamiento con delay
        setTimeout(() => {
            setIsProcessing(false);
            const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
            setLastFourDigits(lastFour);
            setShowSuccessModal(true);
            // No limpiamos el carrito aquí, lo haremos cuando cierre el modal
        }, 2500);
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
                                <span>Total de articulos:</span>
                                <span>${selectedSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="detail-line shipping">
                                <span>Envio:</span>
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

                        {/* Formulario de Pago con Visa Card Visual */}
                        <div className="payment-form">
                            <h4>Datos de la Tarjeta</h4>
                            
                            {/* Vista previa de tarjeta */}
                            <div className="card-preview">
                                <div className="card-preview-inner">
                                    <div className="card-chip"></div>
                                    <div className="card-number-preview">
                                        {cardNumber || '#### #### #### ####'}
                                    </div>
                                    <div className="card-details-preview">
                                        <div className="card-name-preview">
                                            {cardName || 'NOMBRE TITULAR'}
                                        </div>
                                        <div className="card-expiry-preview">
                                            {expiryDate || 'MM/AA'}
                                        </div>
                                    </div>
                                    <div className="card-logo-preview">VISA</div>
                                </div>
                            </div>

                            {/* Nombre del titular */}
                            <input 
                                type="text" 
                                className={`payment-input ${errors.cardName ? 'input-error' : ''}`}
                                placeholder="Nombre del titular" 
                                value={cardName} 
                                onChange={handleCardNameChange}
                                maxLength={30}
                            />
                            {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                            
                            {/* Número de tarjeta */}
                            <input 
                                type="text" 
                                className={`payment-input ${errors.cardNumber ? 'input-error' : ''}`}
                                placeholder="Numero de Tarjeta (inicie con 4 o 5)" 
                                value={cardNumber} 
                                onChange={handleCardNumberChange}
                                maxLength={19}
                            />
                            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                            
                            <div className="card-details-row">
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className={`payment-input ${errors.expiryDate ? 'input-error' : ''}`}
                                        placeholder="MM/AA" 
                                        value={expiryDate} 
                                        onChange={handleExpiryDateChange}
                                        maxLength={5}
                                    />
                                    {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                                </div>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className={`payment-input ${errors.cvv ? 'input-error' : ''}`}
                                        placeholder="CVV" 
                                        value={cvv} 
                                        onChange={handleCvvChange}
                                        maxLength={3}
                                    />
                                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                </div>
                            </div>
                            
                            <p className="card-hint">Solo tarjetas que inicien con 4 o 5 son aceptadas (simulacion)</p>
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
                            
                            <p className="trust-disclaimer">
                                Nexora se compromete a proteger tu informacion de pago.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modal de Exito Flotante */}
            {showSuccessModal && (
                <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="success-modal-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h2>¡Pago Exitoso!</h2>
                        <div className="success-modal-details">
                            <p>Tu compra ha sido procesada correctamente</p>
                            <div className="success-modal-card">
                                <span className="card-label">Tarjeta utilizada:</span>
                                <span className="card-number">**** **** **** {lastFourDigits}</span>
                            </div>
                            <div className="success-modal-amount">
                                <span className="amount-label">Monto pagado:</span>
                                <span className="amount-value">${selectedSubtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <button 
                            className="success-modal-btn"
                            onClick={() => {
                                clearCart();
                                setShowSuccessModal(false);
                                setPaymentSuccess(true);
                            }}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagePay;
