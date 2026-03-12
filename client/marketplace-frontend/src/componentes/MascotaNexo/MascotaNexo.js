import { useState } from "react";
import Nexo from "../../resource/MascotaNexo/Nexo.svg";
import "./MascotaNexo.css";

export default function Mascota() {

  const [mensaje, setMensaje] = useState("Hola 👋 ¿Necesitas ayuda?");
  const [visible, setVisible] = useState(true);

  const mensajes = [
    "Puedes usar el menú para navegar",
    "Revisa tus notificaciones 🔔",
    "Usa el buscador para encontrar cosas",
    "Si necesitas ayuda estoy aquí"
  ];

  const cambiarMensaje = () => {
    const random = mensajes[Math.floor(Math.random() * mensajes.length)];
    setMensaje(random);
  };

  // 🔹 si está oculta mostramos solo botón para abrir
  if (!visible) {
    return (
      <button
        className="mascota-mostrar"
        onClick={() => setVisible(true)}
      >
        🐾
      </button>
    );
  }

  return (
    <div className="mascota-container">

      <img
        src={Nexo}
        className="mascota"
        alt="Mascota Nexora"
      />

      <div className="mascota-mensaje">
        {mensaje}
      </div>

      <div className="mascota-botones">
        <button
            className="mascota-ayuda"
            onClick={cambiarMensaje}
        >
            ?
        </button>

        <button
            className="mascota-ocultar"
            onClick={() => setVisible(false)}
        >
            —
        </button>
       </div>
    </div>
  );
}