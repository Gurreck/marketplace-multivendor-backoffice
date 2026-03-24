import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/commentService';
import { orderService } from '../../services/orderService';
import './paymentGateway.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';


const PaymentGateway = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const { clearCart, cartItems, cartTotal, cartCount } = useCart();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

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



    const [address, setAddress] = useState({
        pais: '',
        provincia: '',
        ciudad: '',
        codigoPostal: '',
        direccion: ''
    });

    const [addressErrors, setAddressErrors] = useState({});

    const validateAddress = () => {
        const newErrors = {};
        if (!address.pais.trim()) newErrors.pais = 'El país es requerido';
        if (!address.provincia.trim()) newErrors.provincia = 'La provincia es requerida';
        if (!address.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
        if (!address.codigoPostal.trim()) newErrors.codigoPostal = 'El código postal es requerido';
        if (!address.direccion.trim()) newErrors.direccion = 'La dirección exacta es requerida';
        return newErrors;
    };

    const handleSaveAddress = () => {
        const errors = validateAddress();
        if (Object.keys(errors).length > 0) {
            setAddressErrors(errors);
        } else {
            setAddressErrors({});
            alert('Dirección guardada correctamente');
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
        if (addressErrors[name]) {
            setAddressErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const luhnCheck = (cardNumber) => {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        let sum = 0;
        let isEven = false;

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

    const detectCardType = (number) => {
        const cleanNumber = number.replace(/\s/g, '');

        if (/^4/.test(cleanNumber)) return 'VISA';
        if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'MASTERCARD';
        if (/^3[47]/.test(cleanNumber)) return 'AMEX';
        if (/^6011/.test(cleanNumber) || /^65/.test(cleanNumber) || /^64[4-9]/.test(cleanNumber) || /^622(12[6-9]|1[3-9]\d|[2-8]\d{2}|91\d|92[0-5])/.test(cleanNumber)) return 'DISCOVER';
        if (/^3[068]/.test(cleanNumber) || /^30[0-5]/.test(cleanNumber)) return 'DINERS';
        if (/^35[2-8]/.test(cleanNumber)) return 'JCB';

        return null;
    };

    const getExpectedLength = (cardType) => {
        switch (cardType) {
            case 'AMEX': return 15;
            case 'DINERS': return 14;
            default: return 16; // Visa, Mastercard, Discover, JCB
        }
    };

    const getExpectedCvvLength = (cardType) => {
        switch (cardType) {
            case 'AMEX': return 4;
            default: return 3;
        }
    };

    const getMaskedCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        if (cleanNumber.length === 0) {
            return '#### #### #### ####';
        }
        if (cleanNumber.length <= 4) {
            return '**** **** **** ' + '*'.repeat(cleanNumber.length);
        }
        const firstDigits = cleanNumber.substring(0, cleanNumber.length - 4);
        const formatted = firstDigits.replace(/(.{4})/g, '$1 ').trim() + ' ****';
        return formatted;
    };

    const validateCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');

        if (!/^\d+$/.test(cleanNumber)) {
            return 'El numero de tarjeta debe contener solo digitos';
        }

        const detectedType = detectCardType(cleanNumber);

        if (!detectedType) {
            return 'Tipo de tarjeta no reconocido. Use Visa, Mastercard, Amex o Discover';
        }

        const expectedLength = getExpectedLength(detectedType);
        if (cleanNumber.length !== expectedLength) {
            if (detectedType === 'AMEX') {
                return `Las tarjetas ${detectedType} deben tener 15 digitos`;
            }
            return `Las tarjetas ${detectedType} deben tener 16 digitos`;
        }

        if (!luhnCheck(cleanNumber)) {
            return 'Numero de tarjeta invalido (fallo validacion Luhn)';
        }

        return null;
    };

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

    const validateCardName = (name) => {
        if (name.trim().length < 3) {
            return 'Ingrese el nombre del titular';
        }
        return null;
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const cleanNumber = v.replace(/\s/g, '');
        const detectedType = detectCardType(cleanNumber);

        if (detectedType === 'AMEX') {
            if (v.length > 4 && v.length <= 10) {
                return v.substring(0, 4) + ' ' + v.substring(4, 10);
            } else if (v.length > 10) {
                return v.substring(0, 4) + ' ' + v.substring(4, 10) + ' ' + v.substring(10, 15);
            }
            return v;
        }

        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiryDateInput = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);

        const cleanNumber = formatted.replace(/\s/g, '');
        const detectedType = detectCardType(cleanNumber);
        setCardType(detectedType);

        const expectedCvvLength = getExpectedCvvLength(detectedType);
        if (cvv.length > expectedCvvLength) {
            setCvv(cvv.substring(0, expectedCvvLength));
        }

        if (errors.cardNumber) {
            setErrors(prev => ({ ...prev, cardNumber: null }));
        }
    };

    const handleExpiryDateChange = (e) => {
        const formatted = formatExpiryDateInput(e.target.value);
        setExpiryDate(formatted);
        if (errors.expiryDate) {
            setErrors(prev => ({ ...prev, expiryDate: null }));
        }
    };

    const handleCvvChange = (e) => {
        const expectedLength = getExpectedCvvLength(cardType);
        const v = e.target.value.replace(/[^0-9]/g, '').substring(0, expectedLength);
        setCvv(v);
        if (errors.cvv) {
            setErrors(prev => ({ ...prev, cvv: null }));
        }
    };

    const handleCardNameChange = (e) => {
        setCardName(e.target.value);
        if (errors.cardName) {
            setErrors(prev => ({ ...prev, cardName: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        setIsProcessing(true);
        setErrors({});

        // Simular procesamiento de pago
        setTimeout(async () => {
            try {
                // Crear el pedido en el backend después del pago exitoso
                const orderData = {
                    items: cartItems.map(item => ({
                        productId: item._id,
                        quantity: item.quantity || 1
                    })),
                    totalAmount: selectedSubtotal,
                    shippingAddress: address,
                    paymentDetails: {
                        lastFourDigits: cardNumber.replace(/\s/g, '').slice(-4),
                        cardType: cardType
                    }
                };

                await orderService.createOrder(orderData);
                
                setIsProcessing(false);
                const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
                setLastFourDigits(lastFour);
                setShowSuccessModal(true);
            } catch (error) {
                console.error('Error creating order:', error);
                setIsProcessing(false);
                alert('Error al procesar el pedido. Por favor, intenta de nuevo.');
            }
        }, 2500);
    };

    const handleGoBack = () => {
        navigate('/checkout');
    };

    const handleContinue = () => {
        clearCart();
        setShowSuccessModal(false);
        navigate('/');
    };

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




            <div className={`contenedor-pasarela ${!isDarkMode ? 'modo-claro' : ''}`}>
                <div className="contenido-principal-pasarela">
                   <div className="diseno-dos-columnas-pasarela"> 
                    <div className="columna-izquierda-pasarela">
                        <div className="direccion-envio direccion-envio-derecha">
                            <h3 className="titulo-direccion-pasarela">📦 Dirección de envío</h3>
                            <div className="formulario-direccion-pasarela">
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.pais ? 'error-entrada' : ''}`}
                                    name="pais"
                                    placeholder="País"
                                    value={address.pais}
                                    onChange={handleAddressChange}
                                    required
                                />
                                {addressErrors.pais && <span className="mensaje-error-direccion-pasarela">{addressErrors.pais}</span>}
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.provincia ? 'error-entrada' : ''}`}
                                    name="provincia"
                                    placeholder="Provincia"
                                    value={address.provincia}
                                    onChange={handleAddressChange}
                                    required
                                />
                                {addressErrors.provincia && <span className="mensaje-error-direccion-pasarela">{addressErrors.provincia}</span>}
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.ciudad ? 'error-entrada' : ''}`}
                                    name="ciudad"
                                    placeholder="Ciudad"
                                    value={address.ciudad}
                                    onChange={handleAddressChange}
                                    required
                                />
                                {addressErrors.ciudad && <span className="mensaje-error-direccion-pasarela">{addressErrors.ciudad}</span>}
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.codigoPostal ? 'error-entrada' : ''}`}
                                    name="codigoPostal"
                                    placeholder="Código Postal"
                                    value={address.codigoPostal}
                                    onChange={handleAddressChange}
                                    required
                                />
                                {addressErrors.codigoPostal && <span className="mensaje-error-direccion-pasarela">{addressErrors.codigoPostal}</span>}
                                <textarea
                                    className={`entrada-direccion-pasarela ${addressErrors.direccion ? 'error-entrada' : ''}`}
                                    name="direccion"
                                    placeholder="Dirección exacta"
                                    value={address.direccion}
                                    onChange={handleAddressChange}
                                    required
                                    rows={4}
                                />
                                {addressErrors.direccion && <span className="mensaje-error-direccion-pasarela">{addressErrors.direccion}</span>}
                                <button
                                    type="button"
                                    className="boton-guardar-direccion"
                                    onClick={handleSaveAddress}
                                >
                                    Guardar dirección
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="columna-derecha-pasarela">
                        <div className="pasarela-de-pago">
                            <h2 className="titulo-pago-pasarela">
                                💳 Completar Pago
                            </h2>
                            <p className="subtitulo-pago-pasarela">
                                Ingresa los datos de tu tarjeta para completar la compra
                            </p>

                        <form onSubmit={handleSubmit}>
                            <div className={`vista-previa-tarjeta-pasarela ${cardType ? cardType.toLowerCase() : ''}`}>
                                <div className="interior-vista-previa-tarjeta">
                                    <div className="chip-tarjeta-pasarela"></div>
                                    <div className="vista-previa-numero-tarjeta">
                                        {getMaskedCardNumber(cardNumber)}
                                    </div>
                                    <div className="vista-previa-detalles-tarjeta">
                                        <div className="vista-previa-nombre-tarjeta">
                                            {cardName || 'NOMBRE TITULAR'}
                                        </div>
                                        <div className="vista-previa-vencimiento-tarjeta">
                                            {expiryDate || 'MM/AA'}
                                        </div>
                                    </div>
                                    <div className={`vista-previa-logo-tarjeta ${cardType ? 'tiene-icono' : ''}`}>
                                        {cardType && (
                                            <div className={`icono-tarjeta-pasarela ${cardType.toLowerCase()}`}>
                                                {cardType === 'VISA' && 'VISA'}
                                                {cardType === 'AMEX' && 'AMEX'}
                                                {cardType === 'DISCOVER' && 'DISC'}
                                                {cardType === 'DINERS' && 'DC'}
                                                {cardType === 'JCB' && 'JCB'}
                                            </div>
                                        )}
                                        <span className="texto-tipo-tarjeta-pasarela">
                                            {!cardType && 'VISA'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="formulario-pago-pasarela">
                                <input
                                    type="text"
                                    className={`entrada-pago-pasarela ${errors.cardName ? 'error-entrada' : ''}`}
                                    placeholder="Nombre del titular"
                                    value={cardName}
                                    onChange={handleCardNameChange}
                                    maxLength={30}
                                />
                                {errors.cardName && <span className="mensaje-error-pasarela">{errors.cardName}</span>}

                                <input
                                    type="text"
                                    className={`entrada-pago-pasarela ${errors.cardNumber ? 'error-entrada' : ''}`}
                                    placeholder="Numero de Tarjeta (inicie con 4, 5, 34, 37, 6011)"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    maxLength={cardType === 'AMEX' ? 17 : 19}
                                />
                                {errors.cardNumber && <span className="mensaje-error-pasarela">{errors.cardNumber}</span>}

                                <div className="fila-detalles-tarjeta-pasarela">
                                    <div className="grupo-entrada-pasarela">
                                        <input
                                            type="text"
                                            className={`entrada-pago-pasarela ${errors.expiryDate ? 'error-entrada' : ''}`}
                                            placeholder="MM/AA"
                                            value={expiryDate}
                                            onChange={handleExpiryDateChange}
                                            maxLength={5}
                                        />
                                        {errors.expiryDate && <span className="mensaje-error-pasarela">{errors.expiryDate}</span>}
                                    </div>
                                    <div className="grupo-entrada-pasarela grupo-entrada-cvv-pasarela">
                                        <input
                                            type={showCvv ? "text" : "password"}
                                            className={`entrada-pago-pasarela ${errors.cvv ? 'error-entrada' : ''}`}
                                            placeholder={cardType === 'AMEX' ? 'CVV (4 digitos)' : 'CVV (3 digitos)'}
                                            value={cvv}
                                            onChange={handleCvvChange}
                                            maxLength={cardType === 'AMEX' ? 4 : 3}
                                        />
                                        <button
                                            type="button"
                                            className="alternar-cvv-pasarela"
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
                                        {errors.cvv && <span className="mensaje-error-pasarela">{errors.cvv}</span>}
                                    </div>
                                </div>

                                <p className="sugerencia-tarjeta-pasarela">
                                    <span className={`indicador-tipo-tarjeta-pasarela ${cardType ? 'activo' : ''}`}>
                                        {cardType ? `💳 ${cardType}` : '💳 Visa/Mastercard/Amex/Discover'}
                                    </span>
                                    <br />
                                    <span className="info-validacion-pasarela">
                                        ✓ Algoritmo de Luhn &nbsp; ✓ Tipo detectado &nbsp; ✓ CVV adaptativo
                                    </span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                className={`boton-enviar-pasarela ${isProcessing ? 'procesando' : ''}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Procesando...' : `Pagar ₡${selectedSubtotal.toLocaleString()}`}
                            </button>
                        </form>

                        <div className="seccion-confianza-pasarela">
                            <p className="texto-pago-seguro-pasarela">🛡️ Opciones de pago seguro</p>

                            
                        </div>
                    </div>
                    </div>
                    </div>
                </div>

                {showSuccessModal && (
                    <div className="capa-modal-exito-pasarela" onClick={() => setShowSuccessModal(false)}>
                        <div className="modal-exito-pasarela" onClick={(e) => e.stopPropagation()}>
                            <div className="icono-modal-exito-pasarela">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2>¡Pago Exitoso!</h2>
                            <div className="detalles-modal-exito-pasarela">
                                <p>Tu compra ha sido procesada correctamente</p>
                                <div className="tarjeta-modal-exito-pasarela">
                                    <span className="etiqueta-tarjeta-pasarela">Tarjeta utilizada:</span>
                                    <span className="pantalla-numero-tarjeta-pasarela">**** **** **** {lastFourDigits}</span>
                                </div>
                                <div className="monto-modal-exito-pasarela">
                                    <span className="etiqueta-monto-pasarela">Monto pagado:</span>
                                    <span className="valor-monto-pasarela">₡{selectedSubtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                className="boton-modal-exito-pasarela"
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

