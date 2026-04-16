import React from "react";
import { CheckCircle2 } from "lucide-react";
import "./ModalExitoPago.css";

const ModalExitoPago = ({
    show,
    isDarkMode,
    maskedCardDisplay,
    selectedSubtotal,
    address,
    handleContinue
}) => {
    if (!show) return null;

    return (
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
                            <span className="valor-modal-pasarela">{maskedCardDisplay}</span>
                        </div>
                        <div className="fila-info-modal-pasarela">
                            <span className="etiqueta-modal-pasarela">Total</span>
                            <span className="valor-modal-pasarela monto-modal-pasarela">
                                ₡{selectedSubtotal.toLocaleString()}
                            </span>
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
    );
};

export default ModalExitoPago;
