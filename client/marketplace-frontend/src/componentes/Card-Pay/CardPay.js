import React, { useState } from 'react';
import './CardPay.css';
import { 
    CreditCard, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    Loader2, 
    Lock
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

const CardPay = ({ selectedSubtotal, selectedItems, address, onPaymentSuccess, onPaymentError }) => {
    const { user } = useAuth();
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
    const [generalError, setGeneralError] = useState('');

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
        setGeneralError('');
        const newErrors = {};
        const cardError = validateCardNumber(cardNumber);
        const expiryError = validateExpiryDate(expiryDate);
        const cvvError = validateCvv(cvv, cardType);
        if (cardError) newErrors.cardNumber = cardError;
        if (expiryError) newErrors.expiryDate = expiryError;
        if (cvvError) newErrors.cvv = cvvError;
        if (cardName.trim().length < 3) newErrors.cardName = 'Ingrese el nombre del titular';
        if (!address) newErrors.general = 'Selecciona una dirección de envío';
        if (!user) newErrors.general = 'Debes iniciar sesión para realizar el pago';
        const token = localStorage.getItem("token");
        if (!token || token === "undefined" || token === "null") newErrors.general = 'Sesión expirada. Inicia sesión nuevamente';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.general) setGeneralError(newErrors.general);
            return;
        }
        setIsProcessing(true);
        try {
            const orderData = {
                items: selectedItems.map(item => ({ product: item._id, quantity: parseInt(item.quantity) })),
                shippingAddress: {
                    pais: 'Argentina',
                    provincia: address.provincia,
                    ciudad: address.ciudad,
                    codigoPostal: address.codigoPostal,
                    direccion: address.direccion
                },
                subtotal: parseFloat(selectedSubtotal),
                shipping: 0,
                total: parseFloat(selectedSubtotal)
            };
            const response = await orderService.createOrder(orderData);
            setIsProcessing(false);
            const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
            setLastFourDigits(lastFour);
            setShowSuccessModal(true);
            if (onPaymentSuccess) {
                onPaymentSuccess(lastFour, true);
            }
        } catch (error) {
            setIsProcessing(false);
            console.log('Error response:', error.response);
            const errorMessage = error.response?.data?.message || 'Error al procesar el pago';
            alert('Error: ' + errorMessage); // Debug
            setGeneralError(errorMessage);
        }
    };

    const handleContinue = () => {
        setShowSuccessModal(false);
        if (onPaymentSuccess) {
            onPaymentSuccess(lastFourDigits, true);
        }
    };

    // ===== RENDERIZADO =====
    return (
        <>
            <div className="pasarela-de-pago">
                <h2 className="titulo-pago-pasarela">
                    <CreditCard size={24} style={{ marginRight: '10px' }} /> Completar Pago
                </h2>
                <p className="subtitulo-pago-pasarela">
                    Ingresa los datos de tu tarjeta
                </p>
                {generalError && (
                    <div className="error-general-pago">
                        {generalError}
                    </div>
                )}

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
        </>
    );
};

export default CardPay;




