import React from "react";
import "./TarjetaPago.css";
import { CreditCard, Loader2, Lock, MapPin } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

// Importación de Logic (Custom Hook)
import useTarjetaPago from "./useTarjetaPago";

// Importación de subcomponentes visuales
import VistaPreviaTarjeta from "./VistaPreviaTarjeta";
import FormularioTarjeta from "./FormularioTarjeta";
import SeccionCupon from "./SeccionCupon";
import ModalExitoPago from "./ModalExitoPago";

const TarjetaPago = (props) => {
    const { isDarkMode } = useTheme();
    
    // Consumimos toda la lógica del hook
    const {
        cardNumber, cardName, expiryDate, cvv, errors,
        isProcessing, showSuccessModal, maskedCardDisplay, cardType,
        showCvv, setShowCvv, generalError, couponCode, setCouponCode,
        couponValidated, setCouponValidated, couponError, setCouponError,
        validatingCoupon, discountAmount, finalTotal,
        handleCardNumberChange, handleExpiryDateChange, handleCvvChange,
        handleValidateCoupon, handleSubmit, handleContinue,
        setCardName
    } = useTarjetaPago(props);

    return (
        <>
            <div className={`pasarela-de-pago ${!isDarkMode ? "modo-claro" : ""}`}>
                <h2 className="titulo-pago-pasarela">
                    <CreditCard size={24} /> Completar Pago
                </h2>
                <p className="subtitulo-pago-pasarela">Ingresa los datos para finalizar tu pedido</p>

                {generalError && <div className="error-general-pago">{generalError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="contenido-tarjeta-dos-columnas">
                        <VistaPreviaTarjeta 
                            cardNumber={cardNumber}
                            cardName={cardName}
                            expiryDate={expiryDate}
                            cardType={cardType}
                        />

                        <FormularioTarjeta 
                            cardName={cardName}
                            setCardName={setCardName}
                            cardNumber={cardNumber}
                            handleCardNumberChange={handleCardNumberChange}
                            expiryDate={expiryDate}
                            handleExpiryDateChange={handleExpiryDateChange}
                            cvv={cvv}
                            handleCvvChange={handleCvvChange}
                            showCvv={showCvv}
                            setShowCvv={setShowCvv}
                            errors={errors}
                        />
                    </div>

                    <SeccionCupon 
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        couponValidated={couponValidated}
                        setCouponValidated={setCouponValidated}
                        couponError={couponError}
                        setCouponError={setCouponError}
                        validatingCoupon={validatingCoupon}
                        handleValidateCoupon={handleValidateCoupon}
                        discountAmount={discountAmount}
                    />

                    <button
                        type="submit"
                        className={`boton-enviar-pasarela ${isProcessing ? "procesando" : ""}`}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="animacion-giro" size={20} />
                        ) : (
                            `Pagar ₡${finalTotal.toLocaleString()}`
                        )}
                    </button>
                    {!props.address && (
                        <div className="advertencia-direccion">
                            <MapPin size={16} />
                            Ingresa una dirección para continuar
                        </div>
                    )}
                </form>

                <div className="seccion-confianza-pasarela">
                    <p className="texto-pago-seguro-pasarela"><Lock size={14} /> Transacción Segura</p>
                </div>
            </div>

            <ModalExitoPago 
                show={showSuccessModal}
                isDarkMode={isDarkMode}
                maskedCardDisplay={maskedCardDisplay}
                selectedSubtotal={props.selectedSubtotal}
                address={props.address}
                handleContinue={handleContinue}
            />
        </>
    );
};

export default TarjetaPago;
