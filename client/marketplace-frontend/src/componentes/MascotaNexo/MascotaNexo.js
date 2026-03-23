import { useState } from "react";
import { useLocation } from "react-router-dom";
import Nexo from "../../resource/MascotaNexo/Nexo.svg";
import "./MascotaNexo.css";

/**
 * Componente Mascota (Nexo)
 * Proporciona mensajes de ayuda y consejos dinámicos según la página en la que se encuentre el usuario.
 */
export default function Mascota() {
  const location = useLocation();

  // ===== ESTADO =====
  const [visible, setVisible] = useState(true); // Controla si la mascota está expandida o minimizada
  const [indiceMensaje, setIndiceMensaje] = useState(0); // Índice del mensaje actual en el carrusel de consejos

  // ===== CONFIGURACIÓN DE MENSAJES =====
  let mensajes = [];

  // Definición de mensajes dinámicos según la ruta actual (pathname)
  if (location.pathname === "/login") {
    mensajes = [
      "No compartas tu contraseña con nadie",
      "Si olvidaste tu contraseña, haz clic en 'Olvidé mi contraseña' para recuperarla",
      "Si no tienes una cuenta, haz clic en 'Registrarse' para crear una y disfrutar de nuestras ofertas"
    ];
  }

  else  if (location.pathname === "/register") {
    mensajes = [
      "Crea una contraseña segura para proteger tu cuenta",
      "Asegúrate de ingresar un email válido para recibir notificaciones",
      "Disfruta de tus compras con Nexora!"
    ];
  }

  else if (location.pathname === "/forgot-password") {
    mensajes = [
      "Ingresa el email asociado a tu cuenta para recibir instrucciones de recuperación",
      "Si el email está registrado podrás restablecer tu contraseña",
      "Si no recibes el email, revisa que esté correctamente ingresado o intenta nuevamente"
    ];
  }

  else if (location.pathname === "/") {
    mensajes = [
      "Hola, soy Nexo, tu asistente virtual, pulsa \"?\" para ver consejos útiles o \"-\" para ocultarme.",
      "Puedes navegar como invitado, pero algunas funciones estarán limitadas",
      "Registrate para disfrutar de todas las funciones",
      "Inicia sesión para acceder a tu cuenta y gestionar tus compras",
      "Puedes filtar productos por categoría para encontrar lo que buscas más rápido",
      "Puedes buscar productos por nombre o descripción usando el buscador en la parte superior",
      "Revisa nuestras promociones destacadas!"
    ];
  }

  else if (location.pathname === "/cliente") {
    mensajes = [
      "Hola, soy Nexo, tu asistente virtual, pulsa \"?\" para ver consejos útiles o \"-\" para ocultarme.",
      "Explora nuevas categorías de productos",
      "Revisa tus productos en el carrito antes de finalizar tu compra",
      "Puedes filtar productos por categoría para encontrar lo que buscas más rápido",
      "Puedes buscar productos por nombre o descripción usando el buscador en la parte superior",
      "Revisa nuestras promociones destacadas!"
    ];
  }

  else if (location.pathname.includes("/product")) {
    mensajes = [
      "Aquí puedes ver los detalles del producto",
      "Revisa la descripción antes de comprar",
      "Puedes agregarlo al carrito"
    ];
  }

  else if (location.pathname.includes("/vendedor")) {
    mensajes = [
      "Aquí puedes ver los detalles del producto",
      "Revisa la descripción antes de comprar",
      "Puedes agregarlo al carrito"
    ];
  }

  else if (location.pathname.includes("/checkout")) {
    mensajes = [
      "",
      "",
      ""
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

  // ===== MANEJADORES DE EVENTOS =====
  /**
   * Cambia al siguiente mensaje disponible en la lista actual
   */
  const cambiarMensaje = () => {
    setIndiceMensaje((indiceMensaje + 1) % mensajes.length);
  };

  // ===== RENDERIZADO CONDICIONAL (MINIMIZADO) =====
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

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <div className="contenedor-mascota">

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
            title="Ver otro consejo"
        >
            ?
        </button>

        <button
            className="mascota-ocultar"
            onClick={() => setVisible(false)}
            title="Ocultar asistente"
        >
            —
        </button>
       </div>
    </div>
  );
}