import { useState, useEffect } from "react";
import { orderService } from "../../../services/orderService";
import servicioGamificacion from "../../../services/gamificationService";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";

import {
    luhnCheck,
    detectCardType,
    formatCardNumber,
    formatExpiryDateInput,
    getExpectedLength,
    getExpectedCvvLength,
} from "./utilsTarjeta";

/**
 * Custom Hook para gestionar la lógica de pago con tarjeta
 */
const useTarjetaPago = ({
    selectedSubtotal,
    selectedItems,
    address,
    initialCard,
    onPaymentSuccess,
    onPaymentError
}) => {
    const { updateProfile } = useAuth();
    const { clearCart } = useCart();

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

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [couponValidated, setCouponValidated] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const discountAmount = couponValidated ? Math.round(selectedSubtotal * (couponValidated.descuentoPorcentaje / 100)) : 0;
    const finalTotal = selectedSubtotal - discountAmount;

    // Pre-poblar datos
    useEffect(() => {
        if (initialCard) {
            setCardNumber(formatCardNumber(initialCard.cardNumber || ""));
            setCardName(initialCard.cardName || "");
            setExpiryDate(initialCard.expiryDate || "");
            const detected = detectCardType(initialCard.cardNumber || "");
            setCardType(detected);
        }
    }, [initialCard]);

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

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidatingCoupon(true); 
        setCouponError('');
        try {
            const resp = await servicioGamificacion.validateCoupon(couponCode);
            setCouponValidated(resp.data);
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Cupón inválido');
        } finally { 
            setValidatingCoupon(false); 
        }
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
        if (e) e.preventDefault();
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
                total: parseFloat(finalTotal),
                paymentMethod: {
                    brand: cardType || "Tarjeta",
                    last4: cardNumber.replace(/\s/g, "").slice(-4)
                },
                couponCode: couponValidated ? couponValidated.codigo : undefined,
            };

            const response = await orderService.createOrder(orderData);
            const createdOrderData = response.data.data || response.data;

            await orderService.markOrderAsPaid(createdOrderData._id);

            // Guardar datos del perfil
            try {
                if (updateProfile) {
                    await updateProfile({
                        debitCard: {
                            cardNumber: cardNumber.replace(/\s/g, ""),
                            cardName,
                            expiryDate,
                            cvv
                        },
                        shippingAddress: {
                            pais: address.pais || "Costa Rica",
                            provincia: address.provincia,
                            ciudad: address.ciudad,
                            codigoPostal: address.codigoPostal,
                            direccion: address.direccion
                        },
                        telefono: address.telefono
                    });
                }
            } catch (err) {
                console.error("No se pudo guardar la información en el perfil:", err);
            }

            setCreatedOrder(createdOrderData);

            const clean = cardNumber.replace(/\s/g, "");
            setLastFourDigits(clean.slice(-4));
            setMaskedCardDisplay(clean.slice(0, 4) + " **** ****");
            setShowSuccessModal(true);
            setIsProcessing(false);

        } catch (error) {
            console.error("Error al procesar pago:", error);
            setIsProcessing(false);
            setGeneralError(
                error.response?.data?.message || "Error al procesar el pago. Intenta de nuevo."
            );
            if (onPaymentError) onPaymentError(error);
        }
    };

    const handleContinue = () => {
        setShowSuccessModal(false);
        if (onPaymentSuccess) {
            onPaymentSuccess(lastFourDigits, true, createdOrder);
        }
    };

    return {
        // States
        cardNumber, setCardNumber,
        expiryDate, setExpiryDate,
        cvv, setCvv,
        cardName, setCardName,
        errors, setErrors,
        isProcessing,
        showSuccessModal,
        lastFourDigits,
        maskedCardDisplay,
        cardType,
        showCvv, setShowCvv,
        generalError,
        createdOrder,
        couponCode, setCouponCode,
        couponValidated, setCouponValidated,
        couponError, setCouponError,
        validatingCoupon,
        discountAmount,
        finalTotal,

        // Handlers
        handleCardNumberChange,
        handleExpiryDateChange,
        handleCvvChange,
        handleValidateCoupon,
        handleSubmit,
        handleContinue
    };
};

export default useTarjetaPago;
