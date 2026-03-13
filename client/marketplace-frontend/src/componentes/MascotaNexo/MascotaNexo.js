import { useState } from "react";
import { useLocation } from "react-router-dom";
import Nexo from "../../resource/MascotaNexo/Nexo.svg";
import "./MascotaNexo.css";

export default function Mascota() {

  const location = useLocation();

  const [visible, setVisible] = useState(true);
  const [indiceMensaje, setIndiceMensaje] = useState(0);

  let mensajes = [];

  // mensajes por página
  if (location.pathname === "/login") {
    mensajes = [
      "Aquí puedes explorar productos 🛒",
      "Usa el buscador para encontrar algo rápido",
      "Revisa las ofertas disponibles"
    ];
  }

  else if (location.pathname === "/cliente") {
    mensajes = [
      "Hola, soy Nexo, tu asistente virtual, pulsa \"?\" para ver consejos útiles o \"-\" para ocultarme.",
      "Aquí puedes gestionar tus productos 📦",
      "Revisa tus ventas recientes",
      "Agrega nuevos productos para vender"
    ];
  }

  else if (location.pathname.includes("/product")) {
    mensajes = [
      "Aquí puedes ver los detalles del producto",
      "Revisa la descripción antes de comprar",
      "Puedes agregarlo al carrito"
    ];
  }

  else if (location.pathname === "/admin/dashboard") {
    mensajes = [
      "Aquí puedes administrar la plataforma",
      "Revisa las estadísticas del sistema",
      "Gestiona usuarios y productos"
    ];
  }

  else {
    mensajes = [
      "Puedes usar el menú para navegar",
      "Revisa tus notificaciones 🔔",
      "Usa el buscador para encontrar cosas",
      "Si necesitas ayuda estoy aquí"
    ];
  }

const cambiarMensaje = () => {
  setIndiceMensaje((indiceMensaje + 1) % mensajes.length);
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
        {mensajes[indiceMensaje]}
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