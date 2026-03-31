import React, { useState, useEffect } from "react";
import "./CardPay.css";
import {
    CreditCard,
    Eye,
    EyeOff,
    CheckCircle2,
    Loader2,
    Lock,
    MapPin,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";

const CardPay = ({
    selectedSubtotal = 0,
    selectedItems = [],
    address = null,
    initialCard = null,
    onPaymentSuccess,
    onPaymentError,
}) => {
    const { user, updateProfile } = useAuth();
    const { clearCart } = useCart();
    const { isDarkMode } = useTheme();

    // ===== UTILIDADES (Definidas antes del useEffect para evitar problemas de hoisting) =====
    const luhnCheck = (num) => {
        const cleanNumber = num.toString().replace(/\s/g, "");
        if (!cleanNumber) return false;
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
        const cleanNumber = number.toString().replace(/\s/g, "");
        if (/^4/.test(cleanNumber)) return "VISA";
        if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return "MASTERCARD";
        if (/^3[47]/.test(cleanNumber)) return "AMEX";
        if (/^6011/.test(cleanNumber) || /^65/.test(cleanNumber) || /^64[4-9]/.test(cleanNumber)) return "DISCOVER";
        if (/^3[068]/.test(cleanNumber) || /^30[0-5]/.test(cleanNumber)) return "DINERS";
        if (/^35[2-8]/.test(cleanNumber)) return "JCB";
        return null;
    };

    const formatCardNumber = (value) => {
        const v = value.toString().replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const detected = detectCardType(v);
        if (detected === "AMEX") {
            if (v.length > 4 && v.length <= 10) return v.substring(0, 4) + " " + v.substring(4, 10);
            if (v.length > 10) return v.substring(0, 4) + " " + v.substring(4, 10) + " " + v.substring(10, 15);
            return v;
        }
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
        return parts.length ? parts.join(" ") : v;
    };

    // ===== ESTADO DE TARJETA =====
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardName, setCardName] = useState("");
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastFourDigits, setLastFourDigits] = useState("");
    const [maskedCardDisplay, setMaskedCardDisplay] = useState("");
    const [cardType, setCardType] = useState(null);
    const [showCvv, setShowCvv] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [createdOrder, setCreatedOrder] = useState(null);

    // Pre-poblar datos si el usuario ya tiene una tarjeta guardada o se pasa una inicial
    useEffect(() => {
        const cardToUse = initialCard || user?.debitCard;
        if (cardToUse) {
            setCardNumber(formatCardNumber(cardToUse.cardNumber || ""));
            setCardName(cardToUse.cardName || "");
            setExpiryDate(cardToUse.expiryDate || "");
            const detected = detectCardType(cardToUse.cardNumber || "");
            setCardType(detected);
        }
    }, [initialCard, user]);

    const getExpectedLength = (type) => {
        if (type === "AMEX") return 15;
        if (type === "DINERS") return 14;
        return 16;
    };

    const getExpectedCvvLength = (type) => {
        return type === "AMEX" ? 4 : 3;
    };

    const getCardLogo = (type) => {
        const logos = {
            VISA: (
                <svg width="100%" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="visaGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#1A1F71" />
                            <stop offset="100%" stopColor="#0D1257" />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="400" height="220" rx="20" fill="url(#visaGrad)" />
                    <rect x="0" y="0" width="400" height="22" rx="20" fill="#F5A623" />
                    <rect x="0" y="11" width="400" height="11" fill="#F5A623" />
                    <rect x="0" y="198" width="400" height="22" rx="20" fill="#F5A623" />
                    <rect x="0" y="198" width="400" height="11" fill="#F5A623" />
                    <text x="200" y="148" textAnchor="middle" fontFamily="Arial Black" fontWeight="900" fontSize="100" fill="white" letterSpacing="6">VISA</text>
                </svg>
            ),
            MASTERCARD: (
                <svg viewBox="0 0 48 32" width="50" height="34">
                    <rect width="48" height="32" rx="4" fill="#000" />
                    <circle cx="18" cy="16" r="9" fill="#EB001B" />
                    <circle cx="30" cy="16" r="9" fill="#F79E1B" />
                    <path d="M24 9.5a9 9 0 0 0 0 13" fill="#FF5F00" />
                </svg>
            ),
            AMEX: (
                <svg viewBox="0 0 48 32" width="50" height="34">
                    <rect width="48" height="32" rx="4" fill="#006FCF" />
                    <path d="M8 12h4l1 2.5 1-2.5h4v7h-3v-4.5l-1.5 3.5h-2l-1.5-3.5v4.5h-3v-7zm14 0h8v2h-5v.5h4.5v2h-4.5v.5h5v2h-8v-7zm10 0h3l2 3.5 2-3.5h3v7h-3v-4l-2 3.5h-2l-2-3.5v4h-3v-7z" fill="#fff" />
                </svg>
            ),
        };
        return logos[type] || <span className="texto-tipo-tarjeta-pasarela">{type || "CARD"}</span>;
    };

    const getMaskedCardNumber = (number) => {
        const clean = number.toString().replace(/\s/g, "");
        if (clean.length === 0) return "#### #### #### ####";
        const parts = clean.match(/.{1,4}/g) || [];
        return parts.join(" ");
    };

    const formatExpiryDateInput = (value) => {
        const v = value.toString().replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2, 4);
        return v;
    };

    // ===== MANEJADORES =====
    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
        const clean = formatted.replace(/\s/g, "");
        setCardType(detectCardType(clean));
        if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: null }));
    };

    const handleExpiryDateChange = (e) => {
        const formatted = formatExpiryDateInput(e.target.value);
        setExpiryDate(formatted);
        if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: null }));
    };

    const handleCvvChange = (e) => {
        const limit = getExpectedCvvLength(cardType);
        const v = e.target.value.replace(/[^0-9]/g, "").substring(0, limit);
        setCvv(v);
        if (errors.cvv) setErrors(prev => ({ ...prev, cvv: null }));
    };

    const validate = () => {
        const newErrors = {};
        const cleanNum = cardNumber.replace(/\s/g, "");
        
        if (!cleanNum) newErrors.cardNumber = "Requerido";
        else if (!luhnCheck(cleanNum)) newErrors.cardNumber = "Número inválido";
        else if (cleanNum.length !== getExpectedLength(cardType)) newErrors.cardNumber = `Deben ser ${getExpectedLength(cardType)} dígitos`;

        if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) newErrors.expiryDate = "Formato MM/AA";
        
        if (!cvv) newErrors.cvv = "CVV requerido";
        else if (cvv.length !== getExpectedCvvLength(cardType)) newErrors.cvv = `CVV de ${getExpectedCvvLength(cardType)} dígitos`;

        if (cardName.length < 3) newErrors.cardName = "Ingresa el titular";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError("");

        if (!address) {
            setGeneralError("Selecciona una dirección de envío primero.");
            return;
        }

        if (!validate()) return;

        setIsProcessing(true);
        try {
            const orderData = {
                items: selectedItems.map(item => ({
                    product: item.product?._id || item._id || item.id,
                    quantity: parseInt(item.quantity)
                })),
                shippingAddress: {
                    pais: address.pais || "Costa Rica",
                    provincia: address.provincia,
                    ciudad: address.ciudad,
                    codigoPostal: address.codigoPostal,
                    direccion: address.direccion
                },
                subtotal: parseFloat(selectedSubtotal),
                shipping: 0,
                total: parseFloat(selectedSubtotal),
                paymentMethod: {
                    brand: cardType || "Tarjeta",
                    last4: cardNumber.replace(/\s/g, "").slice(-4)
                }
            };

            const response = await orderService.createOrder(orderData);
            
            // Actualizar perfil con los últimos datos usados
            try {
                if (updateProfile) {
                    await updateProfile({
                        debitCard: {
                            cardNumber: cardNumber.replace(/\s/g, ""),
                            cardName,
                            expiryDate,
                            cvv
                        }
                    });
                }
            } catch (err) {
                console.error("No se pudo guardar la tarjeta en el perfil:", err);
            }

            setCreatedOrder(response.data.data || response.data);
            const clean = cardNumber.replace(/\s/g, "");
            setLastFourDigits(clean.slice(-4));
            setMaskedCardDisplay(clean.slice(0, 4) + " **** ****");
            setShowSuccessModal(true);
            setIsProcessing(false);
        } catch (error) {
            console.error("Error al procesar pago:", error);
            setIsProcessing(false);
            setGeneralError(error.response?.data?.message || "Error al procesar el pago. Intenta de nuevo.");
            if (onPaymentError) onPaymentError(error);
        }
    };

    const handleContinue = () => {
        setShowSuccessModal(false);
        if (onPaymentSuccess) {
            onPaymentSuccess(lastFourDigits, true, createdOrder);
        }
    };

    return (
        <>
            <div className={`pasarela-de-pago ${!isDarkMode ? "modo-claro" : ""}`}>
                <h2 className="titulo-pago-pasarela">
                    <CreditCard size={24} /> Completar Pago
                </h2>
                <p className="subtitulo-pago-pasarela">Ingresa los datos para finalizar tu pedido</p>

                {generalError && <div className="error-general-pago">{generalError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={`vista-previa-tarjeta-pasarela ${cardType ? cardType.toLowerCase() : ""}`}>
                        <div className="interior-vista-previa-tarjeta">
                            <div className="chip-tarjeta-pasarela"></div>
                            <div className="vista-previa-numero-tarjeta">
                                {getMaskedCardNumber(cardNumber)}
                            </div>
                            <div className="vista-previa-detalles-tarjeta">
                                <div className="vista-previa-nombre-tarjeta">
                                    {cardName.toUpperCase() || "TITULAR DE TARJETA"}
                                </div>
                                <div className="vista-previa-vencimiento-tarjeta">
                                    {expiryDate || "MM/AA"}
                                </div>
                            </div>
                            <div className="vista-previa-logo-tarjeta">
                                {getCardLogo(cardType)}
                            </div>
                        </div>
                    </div>

                    <div className="formulario-pago-pasarela">
                        <input
                            type="text"
                            placeholder="Nombre en la tarjeta"
                            className={`entrada-pago-pasarela ${errors.cardName ? "error-entrada" : ""}`}
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                        />
                        {errors.cardName && <span className="mensaje-error-pasarela">{errors.cardName}</span>}

                        <input
                            type="text"
                            placeholder="Número de tarjeta"
                            className={`entrada-pago-pasarela ${errors.cardNumber ? "error-entrada" : ""}`}
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                        />
                        {errors.cardNumber && <span className="mensaje-error-pasarela">{errors.cardNumber}</span>}

                        <div className="fila-detalles-tarjeta-pasarela">
                            <div className="grupo-entrada-pasarela">
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    className={`entrada-pago-pasarela ${errors.expiryDate ? "error-entrada" : ""}`}
                                    value={expiryDate}
                                    onChange={handleExpiryDateChange}
                                    maxLength={5}
                                />
                                {errors.expiryDate && <span className="mensaje-error-pasarela">{errors.expiryDate}</span>}
                            </div>
                            <div className="grupo-entrada-pasarela">
                                <div className="campo-cvv-pasarela">
                                    <input
                                        type={showCvv ? "text" : "password"}
                                        placeholder="CVV"
                                        className={`entrada-pago-pasarela ${errors.cvv ? "error-entrada" : ""}`}
                                        value={cvv}
                                        onChange={handleCvvChange}
                                    />
                                    <button type="button" className="alternar-cvv-pasarela" onClick={() => setShowCvv(!showCvv)}>
                                        {showCvv ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.cvv && <span className="mensaje-error-pasarela">{errors.cvv}</span>}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`boton-enviar-pasarela ${isProcessing ? "procesando" : ""}`}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="animacion-giro" size={20} />
                        ) : (
                            `Pagar ₡${selectedSubtotal.toLocaleString()}`
                        )}
                    </button>
                    {!address && (
                        <div className="advertencia-direccion">
                            <MapPin size={16} />
                            Ingresa una dirección para continuar
                        </div>
                    )}
                </form>

                <div className="seccion-confianza-pasarela">
                    <p className="texto-pago-seguro-pasarela"><Lock size={14} /> Transacción Segura</p>
                    <div className="metodos-pago-pasarela">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>Amex</span>
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <div className={`capa-modal-exito-pasarela ${!isDarkMode ? "modo-claro" : ""}`}>
                    <div className={`modal-exito-pasarela ${!isDarkMode ? "modo-claro" : ""}`}>
                        <div className="icono-modal-exito-pasarela">
                            <CheckCircle2 size={60} color="#10b981" />
                        </div>
                        <h2>¡Pago Confirmado!</h2>
                        <div className="detalles-modal-exito-pasarela">
                            <p className="mensaje-exito-pasarela">Gracias por confiar en Nexora. Tu pedido está en camino.</p>
                            <div className="info-tarjeta-modal-pasarela">
                                <div className="fila-info-modal-pasarela">
                                    <span className="etiqueta-modal-pasarela">Tarjeta</span>
                                    <span className="valor-modal-pasarela">{maskedCardDisplay} ****</span>
                                </div>
                                <div className="fila-info-modal-pasarela">
                                    <span className="etiqueta-modal-pasarela">Total</span>
                                    <span className="valor-modal-pasarela monto-modal-pasarela">₡{selectedSubtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            {address && (
                                <div className="info-direccion-modal-pasarela">
                                    <div className="direccion-detalle-modal">
                                        <p><strong>Envío a:</strong> {address.direccion}</p>
                                        <p>{address.ciudad}, {address.provincia}</p>
                                    </div>
                                </div>
                            )}
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
