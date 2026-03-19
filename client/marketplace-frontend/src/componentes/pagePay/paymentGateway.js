import React, { useState } from 'react';
import './paymentGateway.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';


const PaymentGateway = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const { clearCart, cartItems, cartTotal, cartCount } = useCart();  // agregar cartCount
    const { user } = useAuth();  // agregar esta línea nueva

    // Get selected items and total from navigation state
    const selectedItems = location.state?.selectedItems || [];
    const selectedSubtotal = location.state?.selectedSubtotal || cartTotal;
    const selectedCount = location.state?.selectedCount || cartItems.length;

    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [cardType, setCardType] = useState(null);
    const [showCvv, setShowCvv] = useState(false);

    // Estados para dirección de envío
    const [address, setAddress] = useState({
        pais: '',
        provincia: '',
        ciudad: '',
        codigoPostal: '',
        direccion: ''
    });

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
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

    // Formatear número de tarjeta con asteriscos para los últimos 4 dígitos
    const getMaskedCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        if (cleanNumber.length === 0) {
            return '#### #### #### ####';
        }
        if (cleanNumber.length <= 4) {
            // Si hay menos de 4 dígitos, mostrar todo como asteriscos
            return '**** **** **** ' + '*'.repeat(cleanNumber.length);
        }
        const firstDigits = cleanNumber.substring(0, cleanNumber.length - 4);
        // Formatear con espacios cada 4 dígitos y añadir asteriscos al final
        const formatted = firstDigits.replace(/(.{4})/g, '$1 ').trim() + ' ****';
        return formatted;
    };

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

    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

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
        }, 2500);
    };

    // Volver al carrito
    const handleGoBack = () => {
        navigate('/checkout');
    };

    // Finalizar compra
    const handleContinue = () => {
        clearCart();
        setShowSuccessModal(false);
        navigate('/');
    };

    return (

        <>
            <div className="navbar-secundario">
                <NavbarSecundario
                    toggleTheme={() => { }}
                    isDarkMode={false}
                    user={user}
                    logout={() => { }}
                    cartCount={cartCount}
                />
            </div>




            <div className="gateway-container">
                {/* Header */}


                <div className="gateway-main-content">
                    {/* Address Section */}
                    <div className="dirección-de-paquetes dirección-de-paquetes-right">
                        <h3 className="gateway-address-title">📦 Dirección de envío</h3>
                        <div className="gateway-address-form">
                            <input
                                type="text"
                                className="gateway-address-input"
                                name="pais"
                                placeholder="País"
                                value={address.pais}
                                onChange={handleAddressChange}
                                required
                            />
                            <input
                                type="text"
                                className="gateway-address-input"
                                name="provincia"
                                placeholder="Provincia"
                                value={address.provincia}
                                onChange={handleAddressChange}
                                required
                            />
                            <input
                                type="text"
                                className="gateway-address-input"
                                name="ciudad"
                                placeholder="Ciudad"
                                value={address.ciudad}
                                onChange={handleAddressChange}
                                required
                            />
                            <input
                                type="text"
                                className="gateway-address-input"
                                name="codigoPostal"
                                placeholder="Código Postal"
                                value={address.codigoPostal}
                                onChange={handleAddressChange}
                                required
                            />
                            <textarea
                                className="gateway-address-input"
                                name="direccion"
                                placeholder="Dirección exacta"
                                value={address.direccion}
                                onChange={handleAddressChange}
                                required
                                rows={4}
                            />
                            <button
                                type="button"
                                className="guardar-direccion-btn"
                                onClick={() => alert('Dirección guardada')}
                            >
                                Guardar dirección
                            </button>
                        </div>
                    </div>

                    {/* Payment Form Section */}
                    <div className="pasarela-de-pago">
                        <h2 className="gateway-payment-title">
                            💳 Completar Pago
                        </h2>
                        <p className="gateway-payment-subtitle">
                            Ingresa los datos de tu tarjeta para completar la compra
                        </p>

                        <form onSubmit={handleSubmit}>
                            {/* Card Preview */}
                            <div className={`gateway-card-preview ${cardType ? cardType.toLowerCase() : ''}`}>
                                <div className="gateway-card-preview-inner">
                                    <div className="gateway-card-chip"></div>
                                    <div className="gateway-card-number-preview">
                                        {getMaskedCardNumber(cardNumber)}
                                    </div>
                                    <div className="gateway-card-details-preview">
                                        <div className="gateway-card-name-preview">
                                            {cardName || 'NOMBRE TITULAR'}
                                        </div>
                                        <div className="gateway-card-expiry-preview">
                                            {expiryDate || 'MM/AA'}
                                        </div>
                                    </div>
                                    <div className={`gateway-card-logo-preview ${cardType ? 'has-icon' : ''}`}>
                                        {cardType && (
                                            <div className={`gateway-card-icon ${cardType.toLowerCase()}`}>
                                                {cardType === 'VISA' && 'VISA'}
                                                {cardType === 'AMEX' && 'AMEX'}
                                                {cardType === 'DISCOVER' && 'DISC'}
                                                {cardType === 'DINERS' && 'DC'}
                                                {cardType === 'JCB' && 'JCB'}
                                            </div>
                                        )}
                                        <span className="gateway-card-type-text">
                                            {!cardType && 'VISA'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Form */}
                            <div className="gateway-payment-form">
                                {/* Nombre del titular */}
                                <input
                                    type="text"
                                    className={`gateway-payment-input ${errors.cardName ? 'input-error' : ''}`}
                                    placeholder="Nombre del titular"
                                    value={cardName}
                                    onChange={handleCardNameChange}
                                    maxLength={30}
                                />
                                {errors.cardName && <span className="gateway-error-message">{errors.cardName}</span>}

                                {/* Número de tarjeta */}
                                <input
                                    type="text"
                                    className={`gateway-payment-input ${errors.cardNumber ? 'input-error' : ''}`}
                                    placeholder="Numero de Tarjeta (inicie con 4, 5, 34, 37, 6011)"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    maxLength={cardType === 'AMEX' ? 17 : 19}
                                />
                                {errors.cardNumber && <span className="gateway-error-message">{errors.cardNumber}</span>}

                                <div className="gateway-card-details-row">
                                    <div className="gateway-input-group">
                                        <input
                                            type="text"
                                            className={`gateway-payment-input ${errors.expiryDate ? 'input-error' : ''}`}
                                            placeholder="MM/AA"
                                            value={expiryDate}
                                            onChange={handleExpiryDateChange}
                                            maxLength={5}
                                        />
                                        {errors.expiryDate && <span className="gateway-error-message">{errors.expiryDate}</span>}
                                    </div>
                                    <div className="gateway-input-group gateway-cvv-input-group">
                                        <input
                                            type={showCvv ? "text" : "password"}
                                            className={`gateway-payment-input ${errors.cvv ? 'input-error' : ''}`}
                                            placeholder={cardType === 'AMEX' ? 'CVV (4 digitos)' : 'CVV (3 digitos)'}
                                            value={cvv}
                                            onChange={handleCvvChange}
                                            maxLength={cardType === 'AMEX' ? 4 : 3}
                                        />
                                        <button
                                            type="button"
                                            className="gateway-cvv-toggle"
                                            onClick={() => setShowCvv(!showCvv)}
                                            title={showCvv ? 'Ocultar CVV' : 'Mostrar CVV'}
                                        >
                                            {showCvv ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                        {errors.cvv && <span className="gateway-error-message">{errors.cvv}</span>}
                                    </div>
                                </div>

                                <p className="gateway-card-hint">
                                    <span className={`gateway-card-type-indicator ${cardType ? 'active' : ''}`}>
                                        {cardType ? `💳 ${cardType}` : '💳 Visa/Mastercard/Amex/Discover'}
                                    </span>
                                    <br />
                                    <span className="gateway-validation-info">
                                        ✓ Algoritmo de Luhn &nbsp; ✓ Tipo detectado &nbsp; ✓ CVV adaptativo
                                    </span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                className={`gateway-submit-btn ${isProcessing ? 'processing' : ''}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Procesando...' : `Pagar ₡${selectedSubtotal.toLocaleString()}`}
                            </button>
                        </form>

                        {/* Trust Section */}
                        <div className="gateway-trust-section">
                            <p className="gateway-secure-payment-text">🛡️ Opciones de pago seguro</p>

                            <div className="gateway-payment-methods">
                                <span>Visa</span>
                                <span>Mastercard</span>
                                <span>Amex</span>
                                <span>Discover</span>
                            </div>

                            <p className="gateway-trust-disclaimer">
                                Nexora se compromete a proteger tu información de pago.
                                Tus datos están encriptados y seguros.
                            </p>
                        </div>
                    </div>
                    {/* Se eliminó el gateway-order-summary */}
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="gateway-success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
                        <div className="gateway-success-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="gateway-success-modal-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2>¡Pago Exitoso!</h2>
                            <div className="gateway-success-modal-details">
                                <p>Tu compra ha sido procesada correctamente</p>
                                <div className="gateway-success-modal-card">
                                    <span className="gateway-card-label">Tarjeta utilizada:</span>
                                    <span className="gateway-card-number-display">**** **** **** {lastFourDigits}</span>
                                </div>
                                <div className="gateway-success-modal-amount">
                                    <span className="gateway-amount-label">Monto pagado:</span>
                                    <span className="gateway-amount-value">₡{selectedSubtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                className="gateway-success-modal-btn"
                                onClick={handleContinue}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentGateway;
