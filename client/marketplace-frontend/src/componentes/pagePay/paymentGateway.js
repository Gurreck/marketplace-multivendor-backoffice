import React, { useState } from 'react';
import { commentService } from '../../services/commentService';
import { orderService } from '../../services/orderService';
import './paymentGateway.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import { 
    MapPin, 
    CreditCard, 
    MessageCircle, 
    Star, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    Loader2, 
    X,
    Lock
} from 'lucide-react';

const PaymentGateway = () => {
    // ===== NAVEGACIÓN Y CONTEXTO =====
    const navigate = useNavigate();
    const location = useLocation();

    const { clearCart, cartTotal, cartCount } = useCart();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const selectedItems = location.state?.selectedItems || [];
    const selectedSubtotal = location.state?.selectedSubtotal || cartTotal;

    // ===== ESTADO DE TARJETA =====

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

    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedProductComments, setSelectedProductComments] = useState([]);
    const [selectedProductInfo, setSelectedProductInfo] = useState(null);
    const [loadingProductComments, setLoadingProductComments] = useState(false);

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
                if (digit > 9) digit -= 9;
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
            default: return 16;
        }
    };

    const getExpectedCvvLength = (cardType) => {
        switch (cardType) {
            case 'AMEX': return 4;
            default: return 3;
        }
    };

    const getProductId = (item) => item._id || item.id;

    const getMaskedCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        if (cleanNumber.length === 0) return '#### #### #### ####';
        if (cleanNumber.length <= 4) return '**** **** **** ' + '*'.repeat(cleanNumber.length);
        const firstDigits = cleanNumber.substring(0, cleanNumber.length - 4);
        const formatted = firstDigits.replace(/(.{4})/g, '$1 ').trim() + ' ****';
        return formatted;
    };

    const validateCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        if (!/^\d+$/.test(cleanNumber)) return 'El número de tarjeta debe contener solo dígitos';
        const detectedType = detectCardType(cleanNumber);
        if (!detectedType) return 'Tipo de tarjeta no reconocido';
        const expectedLength = getExpectedLength(detectedType);
        if (cleanNumber.length !== expectedLength) return `Las tarjetas ${detectedType} deben tener ${expectedLength} dígitos`;
        if (!luhnCheck(cleanNumber)) return 'Número de tarjeta inválido';
        return null;
    };

    const validateExpiryDate = (date) => {
        if (!/^\d{2}\/\d{2}$/.test(date)) return 'Formato inválido. Use MM/AA';
        const [month, year] = date.split('/').map(Number);
        if (month < 1 || month > 12) return 'Mes inválido (01-12)';
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) return 'La tarjeta está vencida';
        return null;
    };

    const validateCvv = (cvvCode, currentCardType = cardType) => {
        const cleanCvv = cvvCode.replace(/\s/g, '');
        const expectedLength = getExpectedCvvLength(currentCardType);
        if (!/^\d+$/.test(cleanCvv)) return 'El CVV debe contener solo dígitos';
        if (cleanCvv.length !== expectedLength) return `El CVV debe tener ${expectedLength} dígitos`;
        return null;
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const cleanNumber = v.replace(/\s/g, '');
        const detectedType = detectCardType(cleanNumber);
        if (detectedType === 'AMEX') {
            if (v.length > 4 && v.length <= 10) return v.substring(0, 4) + ' ' + v.substring(4, 10);
            else if (v.length > 10) return v.substring(0, 4) + ' ' + v.substring(4, 10) + ' ' + v.substring(10, 15);
            return v;
        }
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiryDateInput = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
        return v;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
        const cleanNumber = formatted.replace(/\s/g, '');
        const detectedType = detectCardType(cleanNumber);
        setCardType(detectedType);
        const expectedCvvLength = getExpectedCvvLength(detectedType);
        if (cvv.length > expectedCvvLength) setCvv(cvv.substring(0, expectedCvvLength));
        if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: null }));
    };

    const handleExpiryDateChange = (e) => {
        const formatted = formatExpiryDateInput(e.target.value);
        setExpiryDate(formatted);
        if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: null }));
    };

    const handleCvvChange = (e) => {
        const expectedLength = getExpectedCvvLength(cardType);
        const v = e.target.value.replace(/[^0-9]/g, '').substring(0, expectedLength);
        setCvv(v);
        if (errors.cvv) setErrors(prev => ({ ...prev, cvv: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        const cardError = validateCardNumber(cardNumber);
        const expiryError = validateExpiryDate(expiryDate);
        const cvvError = validateCvv(cvv, cardType);
        if (cardError) newErrors.cardNumber = cardError;
        if (expiryError) newErrors.expiryDate = expiryError;
        if (cvvError) newErrors.cvv = cvvError;
        if (cardName.trim().length < 3) newErrors.cardName = 'Ingrese el nombre del titular';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (Object.keys(validateAddress()).length > 0) {
            setAddressErrors(validateAddress());
            return;
        }

        setIsProcessing(true);

        const orderPayload = {
            items: selectedItems.map((item) => ({
                product: getProductId(item),
                quantity: item.quantity,
            })),
            shippingAddress: address,
            subtotal: selectedSubtotal,
            shipping: 0,
            total: selectedSubtotal,
        };

        try {
            const response = await orderService.createOrder(orderPayload);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error al crear la orden');
            }

            const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
            setLastFourDigits(lastFour);
            setShowSuccessModal(true);
            clearCart();
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'No se pudo procesar el pago';
            setErrors((prev) => ({ ...prev, submit: msg }));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleContinue = () => {
        clearCart();
        setShowSuccessModal(false);
        navigate('/');
    };

    // ===== RENDERIZADO PRINCIPAL =====
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
                        <div className="direccion-envio">
                            <h3 className="titulo-direccion-pasarela"><MapPin size={20} style={{ marginRight: '10px' }} /> Dirección de envío</h3>
                            <div className="formulario-direccion-pasarela">
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.pais ? 'error-entrada' : ''}`}
                                    name="pais"
                                    placeholder="País"
                                    value={address.pais}
                                    onChange={handleAddressChange}
                                />
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.provincia ? 'error-entrada' : ''}`}
                                    name="provincia"
                                    placeholder="Provincia"
                                    value={address.provincia}
                                    onChange={handleAddressChange}
                                />
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.ciudad ? 'error-entrada' : ''}`}
                                    name="ciudad"
                                    placeholder="Ciudad"
                                    value={address.ciudad}
                                    onChange={handleAddressChange}
                                />
                                <input
                                    type="text"
                                    className={`entrada-direccion-pasarela ${addressErrors.codigoPostal ? 'error-entrada' : ''}`}
                                    name="codigoPostal"
                                    placeholder="Código Postal"
                                    value={address.codigoPostal}
                                    onChange={handleAddressChange}
                                />
                                <textarea
                                    className={`entrada-direccion-pasarela ${addressErrors.direccion ? 'error-entrada' : ''}`}
                                    name="direccion"
                                    placeholder="Dirección exacta"
                                    value={address.direccion}
                                    onChange={handleAddressChange}
                                    rows={3}
                                />
                                <button
                                    type="button"
                                    className="boton-guardar-direccion"
                                    onClick={handleSaveAddress}
                                >
                                    Guardar dirección
                                </button>
                            </div>
                        </div>

                        <div className="resenas-en-direccion-pasarela">
                            <h3 className="titulo-resenas-pasarela"><MessageCircle size={20} style={{ marginRight: '10px' }} /> Reseñas de Productos</h3>
                            <div className="lista-productos-resenas-pasarela">
                                {selectedItems.map((item, index) => (
                                    <div key={item._id || item.id || index} className="tarjeta-producto-resena-pasarela">
                                        <img 
                                            src={item.images?.[0]?.url || item.image || "https://via.placeholder.com/60"} 
                                            alt={item.name} 
                                            className="imagen-producto-resena-pasarela"
                                        />
                                        <div className="info-producto-resena-pasarela">
                                            <span className="nombre-producto-resena-pasarela">{item.name}</span>
                                            <button 
                                                className="boton-ver-resenas-pasarela"
                                                onClick={() => fetchProductComments(item)}
                                            >
                                                Ver reseñas
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="columna-derecha-pasarela">
                        <div className="pasarela-de-pago">
                            <h2 className="titulo-pago-pasarela">
                                <CreditCard size={24} style={{ marginRight: '10px' }} /> Completar Pago
                            </h2>
                            <p className="subtitulo-pago-pasarela">
                                Ingresa los datos de tu tarjeta
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
                                            {cardName.toUpperCase() || 'NOMBRE TITULAR'}
                                        </div>
                                        <div className="vista-previa-vencimiento-tarjeta">
                                            {expiryDate || 'MM/AA'}
                                        </div>
                                    </div>
                                    <div className="vista-previa-logo-tarjeta">
                                        {cardType || 'CARD'}
                                    </div>
                                </div>
                            </div>

                            <div className="formulario-pago-pasarela">
                                <input
                                    type="text"
                                    className={`entrada-pago-pasarela ${errors.cardName ? 'error-entrada' : ''}`}
                                    placeholder="Nombre en la tarjeta"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className={`entrada-pago-pasarela ${errors.cardNumber ? 'error-entrada' : ''}`}
                                    placeholder="Número de tarjeta"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                />
                                <div className="fila-detalles-tarjeta-pasarela">
                                    <input
                                        type="text"
                                        className={`entrada-pago-pasarela ${errors.expiryDate ? 'error-entrada' : ''}`}
                                        placeholder="MM/AA"
                                        value={expiryDate}
                                        onChange={handleExpiryDateChange}
                                        maxLength={5}
                                    />
                                    <div className="campo-cvv-pasarela">
                                        <input
                                            type={showCvv ? "text" : "password"}
                                            className={`entrada-pago-pasarela ${errors.cvv ? 'error-entrada' : ''}`}
                                            placeholder="CVV"
                                            value={cvv}
                                            onChange={handleCvvChange}
                                        />
                                        <button
                                            type="button"
                                            className="alternar-cvv-pasarela"
                                            onClick={() => setShowCvv(!showCvv)}
                                        >
                                            {showCvv ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                {errors.cardNumber && <span className="mensaje-error-pasarela">{errors.cardNumber}</span>}
                                {errors.expiryDate && <span className="mensaje-error-pasarela">{errors.expiryDate}</span>}
                                {errors.cvv && <span className="mensaje-error-pasarela">{errors.cvv}</span>}
                                {errors.cardName && <span className="mensaje-error-pasarela">{errors.cardName}</span>}
                                {errors.submit && <span className="mensaje-error-pasarela">{errors.submit}</span>}
                            </div>

                            <button
                                type="submit"
                                className={`boton-enviar-pasarela ${isProcessing ? 'procesando' : ''}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="animacion-giro" size={18} style={{ marginRight: '10px' }} /> Procesando...</>
                                ) : `Pagar ₡${selectedSubtotal.toLocaleString()}`}
                            </button>
                        </form>

                        <div className="seccion-confianza-pasarela">
                            <p className="texto-pago-seguro-pasarela"><Lock size={14} style={{ marginRight: '8px' }} /> Pagos encriptados y seguros</p>
                            <div className="metodos-pago-pasarela">
                                <span>Visa</span>
                                <span>Mastercard</span>
                                <span>Amex</span>
                                <span>Discover</span>
                            </div>
                        </div>
                    </div>
                    </div>
                    </div>
                </div>

                {showCommentsModal && (
                    <div className="capa-modal-comentarios-pasarela" onClick={() => setShowCommentsModal(false)}>
                        <div className="modal-comentarios-pasarela" onClick={(e) => e.stopPropagation()}>
                            <div className="encabezado-modal-comentarios-pasarela">
                                <div className="info-producto-modal-comentarios-pasarela">
                                    <img 
                                        src={selectedProductInfo?.image?.url || selectedProductInfo?.image || "https://via.placeholder.com/80"} 
                                        alt={selectedProductInfo?.name} 
                                        className="imagen-producto-modal-comentarios-pasarela"
                                    />
                                    <div>
                                        <h3>{selectedProductInfo?.name}</h3>
                                        <div className="calificacion-modal-comentarios-pasarela">
                                            <span className="numero-calificacion-pasarela">{selectedProductInfo?.averageRating || "0"}</span>
                                            <div className="estrellas-calificacion">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        fill={i < Math.round(selectedProductInfo?.averageRating || 0) ? "#fbbf24" : "none"} 
                                                        color={i < Math.round(selectedProductInfo?.averageRating || 0) ? "#fbbf24" : "#ccc"} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="conteo-calificacion">({selectedProductInfo?.totalComments || 0})</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="cerrar-modal-pasarela" onClick={() => setShowCommentsModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="cuerpo-modal-comentarios-pasarela">
                                {loadingProductComments ? (
                                    <div className="cargando-comentarios-pasarela"><Loader2 className="animacion-giro" /></div>
                                ) : selectedProductComments.length === 0 ? (

                                    <div className="comentarios-vacios-pasarela">
                                        <MessageCircle size={40} opacity={0.3} />
                                        <p>Aún no hay comentarios para este producto.</p>
                                    </div>
                                ) : (
                                    <div className="lista-comentarios-pasarela">
                                        {selectedProductComments.map((comment) => (

                                            <div key={comment._id} className="item-comentario-pasarela">
                                                <div className="encabezado-comentario-pasarela">
                                                    <div className="info-comentario-pasarela">
                                                        <span className="usuario-comentario-pasarela">{comment.user?.nombre || "Usuario"}</span>
                                                        <span className="fecha-comentario-pasarela">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="calificacion-comentario-pasarela">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < comment.rating ? "#fbbf24" : "none"} color={i < comment.rating ? "#fbbf24" : "#ccc"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="texto-comentario-pasarela">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="capa-modal-exito-pasarela">
                        <div className="modal-exito-pasarela">
                            <div className="icono-modal-exito-pasarela">
                                <CheckCircle2 size={60} color="#10b981" />
                            </div>
                            <h2>¡Pago Confirmado!</h2>
                            <div className="detalles-modal-exito-pasarela">
                                <p>Gracias por tu compra. Tu pedido está siendo procesado.</p>
                                <div className="tarjeta-modal-exito-pasarela">
                                    <span>Tarjeta: **** {lastFourDigits}</span>
                                    <span>Total pagado: ₡{selectedSubtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <button className="boton-modal-exito-pasarela" onClick={handleContinue}>
                                Volver al Inicio
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentGateway;
