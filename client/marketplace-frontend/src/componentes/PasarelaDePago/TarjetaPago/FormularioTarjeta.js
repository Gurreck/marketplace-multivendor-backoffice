import React from "react";
import { Eye, EyeOff } from "lucide-react";
import "./FormularioTarjeta.css";

const FormularioTarjeta = ({
    cardName,
    setCardName,
    cardNumber,
    handleCardNumberChange,
    expiryDate,
    handleExpiryDateChange,
    cvv,
    handleCvvChange,
    showCvv,
    setShowCvv,
    errors
}) => {
    return (
        <div className="columna-derecha-formulario">
            <div className="formulario-pago-pasarela">
                <div className="grupo-entrada-pasarela">
                    <input
                        type="text"
                        placeholder="Nombre en la tarjeta"
                        className={`entrada-pago-pasarela ${errors.cardName ? "error-entrada" : ""}`}
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                    />
                    {errors.cardName && <span className="mensaje-error-pasarela">{errors.cardName}</span>}
                </div>

                <div className="grupo-entrada-pasarela">
                    <input
                        type="text"
                        placeholder="Número de tarjeta"
                        className={`entrada-pago-pasarela ${errors.cardNumber ? "error-entrada" : ""}`}
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                    />
                    {errors.cardNumber && <span className="mensaje-error-pasarela">{errors.cardNumber}</span>}
                </div>

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
        </div>
    );
};

export default FormularioTarjeta;
