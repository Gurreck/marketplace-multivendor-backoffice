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

    const navigate = useNavigate();
    const location = useLocation();

    const { clearCart, cartTotal, cartCount } = useCart();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const selectedItems = location.state?.selectedItems || [];
    const selectedSubtotal = location.state?.selectedSubtotal || cartTotal;

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
        return null;
    };

    const getExpectedLength = (cardType) => cardType === 'AMEX' ? 15 : 16;
    const getExpectedCvvLength = (cardType) => cardType === 'AMEX' ? 4 : 3;

    const validateCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        if (!/^\d+$/.test(cleanNumber)) return 'Solo números';
        const detectedType = detectCardType(cleanNumber);
        if (!detectedType) return 'Tarjeta no válida';
        const expectedLength = getExpectedLength(detectedType);
        if (cleanNumber.length !== expectedLength)
            return `Las tarjetas ${detectedType} deben tener ${expectedLength} dígitos`;
        if (!luhnCheck(cleanNumber)) return 'Número inválido';
        return null;
    };

    const validateExpiryDate = (date) => {
        if (!/^\d{2}\/\d{2}$/.test(date)) return 'Formato MM/AA';
        return null;
    };

    const validateCvv = (cvvCode, currentCardType = cardType) => {
        const clean = cvvCode.replace(/\s/g, '');
        const expected = getExpectedCvvLength(currentCardType);
        if (clean.length !== expected)
            return `El CVV debe tener ${expected} dígitos`;
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const cardError = validateCardNumber(cardNumber);
        const expiryError = validateExpiryDate(expiryDate);
        const cvvError = validateCvv(cvv);

        if (cardError) newErrors.cardNumber = cardError;
        if (expiryError) newErrors.expiryDate = expiryError;
        if (cvvError) newErrors.cvv = cvvError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsProcessing(true);

        try {
            await orderService.createOrder({});
            setLastFourDigits(cardNumber.slice(-4));
            setShowSuccessModal(true);
            clearCart();
        } catch (error) {
            setErrors({ submit: 'Error al pagar' });
        } finally {
            setIsProcessing(false);
        }
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
                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Nombre"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Tarjeta"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="MM/AA"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                    />

                    <input
                        type={showCvv ? "text" : "password"}
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                    />

                    <button type="submit" className={`boton-enviar-pasarela ${isProcessing ? 'procesando' : ''}`}>
                        {isProcessing ? "Procesando..." : `Pagar ₡${selectedSubtotal.toLocaleString()}`}
                    </button>

                </form>
            </div>

            {showSuccessModal && (
                <div>
                    <CheckCircle2 />
                    <p>Pago exitoso</p>
                    <p>**** {lastFourDigits}</p>
                    <button onClick={() => navigate('/')}>Volver</button>
                </div>
            )}
        </>
    );
};

export default PaymentGateway;