import { useState } from "react";
import "./card-payment.css";

export default function CardPayment() {
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("");

  const detectarTipo = (num) => {
    if (/^4/.test(num)) return "visa";
    if (/^5[1-5]/.test(num)) return "mastercard";
    return "";
  };

  const formatearNumero = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const handleNumero = (e) => {
    const limpio = formatearNumero(e.target.value);
    setNumero(limpio);

    const tipoDetectado = detectarTipo(limpio.replace(/\s/g, ""));
    setTipo(tipoDetectado);
  };

  return (
    <div className="pasarela-de-pago">
      <h2 className="titulo-pago-pasarela">Pago</h2>
      <p className="subtitulo-pago-pasarela">Ingresa tu tarjeta</p>

      <div className={`vista-previa-tarjeta-pasarela ${tipo}`}>
        <div className="vista-previa-numero-tarjeta">
          {numero || "•••• •••• •••• ••••"}
        </div>
      </div>

      <input
        type="text"
        placeholder="Número de tarjeta"
        value={numero}
        onChange={handleNumero}
        className="entrada-pago-pasarela"
      />

      <div className="fila-detalles-tarjeta-pasarela">
        <input type="text" placeholder="MM/AA" className="entrada-pago-pasarela" />
        <input type="text" placeholder="CVV" className="entrada-pago-pasarela" />
      </div>

      <button className="boton-enviar-pasarela">
        Pagar
      </button>
    </div>
  );
}