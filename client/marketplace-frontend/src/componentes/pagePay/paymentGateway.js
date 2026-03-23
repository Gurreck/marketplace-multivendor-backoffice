import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/commentService';
import './paymentGateway.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';


const PaymentGateway = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const { clearCart, cartItems, cartTotal, cartCount } = useCart();  // agregar cartCount
    const { user, logout } = useAuth();  // agregar esta línea nueva
    const { isDarkMode, toggleTheme } = useTheme();

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

    // Estado para el modal de comentarios
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedProductComments, setSelectedProductComments] = useState([]);
    const [selectedProductInfo, setSelectedProductInfo] = useState(null);
    const [loadingProductComments, setLoadingProductComments] = useState(false);

    // Función para obtener comentarios de un producto
    const fetchProductComments = async (product) => {
        setLoadingProductComments(true);
        try {
            const productId = product._id || product.id;
            const response = await commentService.getCommentsByProduct(productId);
            if (response.data.success) {
                setSelectedProductComments(response.data.data);
                setSelectedProductInfo({
                    name: product.name,
                    image: product.images?.[0] || product.image,
                    averageRating: response.data.averageRating,
                    totalComments: response.data.count
                });
                setShowCommentsModal(true);
            }
        } catch (error) {
            console.error("Error fetching product comments:", error);
        } finally {
            setLoadingProductComments(false);
        }
    };

    // Estados para dirección de envío
    const [address, setAddress] = useState({
        pais: '',
        provincia: '',
        ciudad: '',
        codigoPostal: '',
        direccion: ''
    });

    // Estado para errores de dirección
    const [addressErrors, setAddressErrors] = useState({});

    // Función para validar la dirección
    const validateAddress = () => {
        const newErrors = {};
        if (!address.pais.trim()) newErrors.pais = 'El país es requerido';
        if (!address.provincia.trim()) newErrors.provincia = 'La provincia es requerida';
        if (!address.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
        if (!address.codigoPostal.trim()) newErrors.codigoPostal = 'El código postal es requerido';
        if (!address.direccion.trim()) newErrors.direccion = 'La dirección exacta es requerida';
        return newErrors;
    };

    // Función para guardar dirección con validación
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
        // Limpiar error de este campo cuando el usuario escriba
        if (addressErrors[name]) {
            setAddressErrors(prev => ({ ...prev, [name]: null }));
        }
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
                {/* Header */}


                <div className="contenido-principal-pasarela">
                    {/* TWO COLUMN LAYOUT: Address (with Reviews at bottom) + Payment */}
                    <div className="diseno-dos-columnas-pasarela">
                    {/* Left Column: Address + Reviews at bottom */}
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

                        {/* Reviews Section - Inside Address Column at Bottom */}
                        <div className="resenas-en-direccion-pasarela">
                            <h3 className="titulo-resenas-pasarela">📝 Reseñas de Productos</h3>
                            <p className="subtitulo-resenas-pasarela">
                                Ver opiniones de otros compradores
                            </p>
                            
                            <div className="lista-productos-resenas-pasarela">
                                {selectedItems.map((item, index) => (
                                    <div key={item._id || item.id || index} className="tarjeta-producto-resena-pasarela">
                                        <img 
                                            src={item.images?.[0] || item.image || "https://via.placeholder.com/60"} 
                                            alt={item.name} 
                                            className="imagen-producto-resena-pasarela"
                                        />
                                        <div className="info-producto-resena-pasarela">
                                            <span className="nombre-producto-resena-pasarela">{item.name}</span>
                                            <button 
                                                className="boton-ver-resenas-pasarela"
                                                onClick={() => fetchProductComments(item)}
                                            >
                                                💬 Ver reseñas
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment Form */}
                    <div className="columna-derecha-pasarela">
                        <div className="pasarela-de-pago">
                            <h2 className="titulo-pago-pasarela">
                                💳 Completar Pago
                            </h2>
                            <p className="subtitulo-pago-pasarela">
                                Ingresa los datos de tu tarjeta para completar la compra
                            </p>

                        <form onSubmit={handleSubmit}>
                            {/* Card Preview */}
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

                            {/* Card Form */}
                            <div className="formulario-pago-pasarela">
                                {/* Nombre del titular */}
                                <input
                                    type="text"
                                    className={`entrada-pago-pasarela ${errors.cardName ? 'error-entrada' : ''}`}
                                    placeholder="Nombre del titular"
                                    value={cardName}
                                    onChange={handleCardNameChange}
                                    maxLength={30}
                                />
                                {errors.cardName && <span className="mensaje-error-pasarela">{errors.cardName}</span>}

                                {/* Número de tarjeta */}
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

                        {/* Trust Section */}
                        <div className="seccion-confianza-pasarela">
                            <p className="texto-pago-seguro-pasarela">🛡️ Opciones de pago seguro</p>

                            <div className="metodos-pago-pasarela">
                                <span>Visa</span>
                                <span>Mastercard</span>
                                <span>Amex</span>
                                <span>Discover</span>
                            </div>

                            <p className="descargo-responsabilidad-pasarela">
                                Nexora se compromete a proteger tu información de pago.
                                Tus datos están encriptados y seguros.
                            </p>
                        </div>
                    </div>
                    </div>
                    </div>
                    {/* Se eliminó el gateway-order-summary */}
                </div>

                {/* Modal de Comentarios del Producto */}
                {showCommentsModal && (
                    <div className="capa-modal-comentarios-pasarela" onClick={() => setShowCommentsModal(false)}>
                        <div className="modal-comentarios-pasarela" onClick={(e) => e.stopPropagation()}>
                            <div className="encabezado-modal-comentarios-pasarela">
                                <div className="info-producto-modal-comentarios-pasarela">
                                    <img 
                                        src={selectedProductInfo?.image || "https://via.placeholder.com/80"} 
                                        alt={selectedProductInfo?.name} 
                                        className="imagen-producto-modal-comentarios-pasarela"
                                    />
                                    <div>
                                        <h3>{selectedProductInfo?.name}</h3>
                                        <div className="calificacion-modal-comentarios-pasarela">
                                            <span className="numero-calificacion">{selectedProductInfo?.averageRating || "0"}</span>
                                            <div className="estrellas-calificacion">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < Math.round(selectedProductInfo?.averageRating || 0) ? "estrella llena" : "estrella"}>★</span>
                                                ))}
                                            </div>
                                            <span className="conteo-calificacion">({selectedProductInfo?.totalComments || 0} comentarios)</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="cerrar-modal-comentarios-pasarela"
                                    onClick={() => setShowCommentsModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="cuerpo-modal-comentarios-pasarela">
                                {loadingProductComments ? (
                                    <div className="cargando-comentarios-pasarela">Cargando comentarios...</div>
                                ) : selectedProductComments.length === 0 ? (
                                    <div className="comentarios-vacios-pasarela">
                                        <span>💬</span>
                                        <p>Aún no hay comentarios para este producto.</p>
                                        <p>¡Sé el primero en opinar!</p>
                                    </div>
                                ) : (
                                    <div className="lista-comentarios-pasarela">
                                        {selectedProductComments.map((comment) => (
                                            <div key={comment._id} className="item-comentario-pasarela">
                                                <div className="encabezado-comentario-pasarela">
                                                    <img 
                                                        src={`https://i.pravatar.cc/150?img=${comment.user?.nombre ? comment.user.nombre.charCodeAt(0) % 70 : 1}`} 
                                                        alt={comment.user?.nombre || "Usuario"} 
                                                        className="avatar-comentario-pasarela"
                                                    />
                                                    <div className="info-comentario-pasarela">
                                                        <span className="usuario-comentario-pasarela">{comment.user?.nombre || "Usuario"}</span>
                                                        <span className="fecha-comentario-pasarela">
                                                            {new Date(comment.createdAt).toLocaleDateString("es-CR")}
                                                        </span>
                                                    </div>
                                                    <div className="calificacion-comentario-pasarela">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < comment.rating ? "estrella llena" : "estrella"}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="texto-comentario-pasarela">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pie-modal-comentarios-pasarela">
                                <button 
                                    className="boton-modal-comentarios-pasarela"
                                    onClick={() => setShowCommentsModal(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
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
