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

    // ============================================
    // VALIDACIÓN REAL DE TARJETAS (ALGORITMO DE LUHN)
    // ============================================

    // Algoritmo de Luhn (Mod 10) - El mismo usado en la vida real
    const luhnCheck = (cardNumber) => {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        let sum = 0;
        let isEven = false;
        
        // Recorrer de derecha a izquierda
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber[i], 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    };

    // Detectar tipo de tarjeta basado en IIN/BIN (Industry Identification Number)
    const detectCardType = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        
        // Visa: empieza con 4
        if (/^4/.test(cleanNumber)) return 'VISA';
        
        // Mastercard: 51-55 o 2221-2720
        if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'MASTERCARD';
        
        // American Express: 34 o 37
        if (/^3[47]/.test(cleanNumber)) return 'AMEX';
        
        // Discover: 6011, 622126-622925, 644-649, 65
        if (/^6011/.test(cleanNumber) || /^65/.test(cleanNumber) || /^64[4-9]/.test(cleanNumber) || /^622(12[6-9]|1[3-9]\d|[2-8]\d{2}|91\d|92[0-5])/.test(cleanNumber)) return 'DISCOVER';
        
        // Diners Club: 300-305, 36, 38
        if (/^3[068]/.test(cleanNumber) || /^30[0-5]/.test(cleanNumber)) return 'DINERS';
        
        // JCB: 3528-3589
        if (/^35[2-8]/.test(cleanNumber)) return 'JCB';
        
        return null;
    };

    // Obtener longitud esperada según tipo de tarjeta
    const getExpectedLength = (cardType) => {
        switch (cardType) {
            case 'AMEX': return 15;
            case 'DINERS': return 14;
            default: return 16; // Visa, Mastercard, Discover, JCB
        }
    };

    // Obtener CVV esperado según tipo de tarjeta
    const getExpectedCvvLength = (cardType) => {
        switch (cardType) {
            case 'AMEX': return 4;
            default: return 3;
        }
    };

    // Estado para el tipo de tarjeta detectado
    const [cardType, setCardType] = useState(null);

    // Validar número de tarjeta con algoritmo de Luhn (como en la vida real)
    const validateCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        
        // Verificar que solo contenga dígitos
        if (!/^\d+$/.test(cleanNumber)) {
            return 'El numero de tarjeta debe contener solo digitos';
        }
        
        // Detectar tipo de tarjeta
        const detectedType = detectCardType(cleanNumber);
        
        if (!detectedType) {
            return 'Tipo de tarjeta no reconocido. Use Visa, Mastercard, Amex o Discover';
        }
        
        // Verificar longitud según tipo de tarjeta
        const expectedLength = getExpectedLength(detectedType);
        if (cleanNumber.length !== expectedLength) {
            if (detectedType === 'AMEX') {
                return `Las tarjetas ${detectedType} deben tener 15 digitos`;
            }
            return `Las tarjetas ${detectedType} deben tener 16 digitos`;
        }
        
        // Aplicar algoritmo de Luhn (validación real)
        if (!luhnCheck(cleanNumber)) {
            return 'Numero de tarjeta invalido (fallo validacion Luhn)';
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

    // Validar CVV (3 dígitos para Visa/MC/Discover, 4 para Amex)
    const validateCvv = (cvvCode, currentCardType = cardType) => {
        const cleanCvv = cvvCode.replace(/\s/g, '');
        const expectedLength = getExpectedCvvLength(currentCardType);
        
        if (!/^\d+$/.test(cleanCvv)) {
            return 'El CVV debe contener solo digitos';
        }
        
        if (cleanCvv.length !== expectedLength) {
            if (expectedLength === 4) {
                return 'El CVV de American Express debe tener 4 digitos';
            }
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

    // Formatear número de tarjeta según el tipo detectado
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const cleanNumber = v.replace(/\s/g, '');
        const detectedType = detectCardType(cleanNumber);
        
        // American Express: 4-6-5 (cada grupo tiene diferente cantidad)
        if (detectedType === 'AMEX') {
            if (v.length > 4 && v.length <= 10) {
                return v.substring(0, 4) + ' ' + v.substring(4, 10);
            } else if (v.length > 10) {
                return v.substring(0, 4) + ' ' + v.substring(4, 10) + ' ' + v.substring(10, 15);
            }
            return v;
        }
        
        // Otros tipos: 4-4-4-4
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
        
        // Detectar tipo de tarjeta en tiempo real
        const cleanNumber = formatted.replace(/\s/g, '');
        const detectedType = detectCardType(cleanNumber);
        setCardType(detectedType);
        
        // Ajustar longitud máxima del CVV según tipo
        const expectedCvvLength = getExpectedCvvLength(detectedType);
        if (cvv.length > expectedCvvLength) {
            setCvv(cvv.substring(0, expectedCvvLength));
        }
        
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
        const expectedLength = getExpectedCvvLength(cardType);
        const v = e.target.value.replace(/[^0-9]/g, '').substring(0, expectedLength);
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
        const cvvError = validateCvv(cvv, cardType);
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
                            <div className={`card-preview ${cardType ? cardType.toLowerCase() : ''}`}>
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
                                    <div className={`card-logo-preview ${cardType ? 'has-icon' : ''}`}>
                                        {cardType && (
                                            <div className={`card-icon ${cardType.toLowerCase()}`}>
                                                {cardType === 'VISA' && 'VISA'}
                                                {cardType === 'AMEX' && 'AMEX'}
                                                {cardType === 'DISCOVER' && 'DISC'}
                                                {cardType === 'DINERS' && 'DC'}
                                                {cardType === 'JCB' && 'JCB'}
                                            </div>
                                        )}
                                        <span className="card-type-text">
                                            {!cardType && 'VISA'}
                                        </span>
                                    </div>
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
                                placeholder="Numero de Tarjeta (inicie con 4, 5, 34, 37, 6011)" 
                                value={cardNumber} 
                                onChange={handleCardNumberChange}
                                maxLength={cardType === 'AMEX' ? 17 : 19}
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
                                        placeholder={cardType === 'AMEX' ? 'CVV (4 digitos)' : 'CVV (3 digitos)'} 
                                        value={cvv} 
                                        onChange={handleCvvChange}
                                        maxLength={cardType === 'AMEX' ? 4 : 3}
                                    />
                                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                </div>
                            </div>
                            
                            <p className="card-hint">
                                <span className={`card-type-indicator ${cardType ? 'active' : ''}`}>
                                    {cardType ? `💳 ${cardType}` : '💳 Visa/Mastercard/Amex/Discover'}
                                </span>
                                <br/>
                                <span className="validation-info">
                                    ✓ Algoritmo de Luhn &nbsp; ✓ Tipo detectado &nbsp; ✓ CVV adaptativo
                                </span>
                            </p>
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
