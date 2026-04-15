import React from "react";
import { ShieldCheck } from "lucide-react";
import "./Resumen.css";

const Resumen = ({ 
  selectedSubtotal, 
  selectedCount, 
  handleProceedToPayment 
}) => {
  return (
    <aside className="barra-lateral-resumen">
      <div className="tarjeta-resumen-fija">
        <h3>Resumen del pedido</h3>

        <div className="detalles-resumen">
          <div className="linea-detalle">
            <span>Total de artículos:</span>
            <span>₡{selectedSubtotal.toLocaleString()}</span>
          </div>
          <div className="linea-detalle envio">
            <span>Envío:</span>
            <span>GRATIS</span>
          </div>
        </div>

        <div className="total-final-resumen">
          <div className="fila-etiqueta-total">
            <strong>Total</strong>
            <span className="monto-total-grande">
              ₡{selectedSubtotal.toLocaleString()}
            </span>
          </div>
          <p className="nota-impuestos">
            Consulta el monto final al completar el pago.
          </p>
        </div>

        <button
          className="boton-enviar-pedido"
          disabled={selectedCount === 0}
          onClick={handleProceedToPayment}
        >
          Proceder al Pago ({selectedCount})
        </button>

        <div className="seccion-confianza-pago">
          <p className="texto-pago-seguro">
            <ShieldCheck
              size={16}
              color="#10b981"
              style={{ marginRight: "8px" }}
            />{" "}
            Pago seguro
          </p>

          <p className="descargo-responsabilidad-confianza">
            Serás redirigido a una página segura para completar tu pago.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Resumen;
