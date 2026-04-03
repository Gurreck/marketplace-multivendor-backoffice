import { useState } from "react";
import { useLocation } from "react-router-dom";
import Nexo from "../../resource/MascotaNexo/Nexo.svg";
import "./MascotaNexo.css";
import { 
  HelpCircle, 
  Minus, 
  PawPrint, 
  Bell 
} from 'lucide-react';

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
      "Hola, soy Nexo, tu asistente virtual. Pulsa el botón de ayuda para consejos útiles.",
      "Puedes navegar como invitado, pero algunas funciones estarán limitadas",
      "Registrate para disfrutar de todas las funciones",
      "Inicia sesión para acceder a tu cuenta y gestionar tus compras",
      "Puedes filtrar productos por categoría para encontrar lo que buscas más rápido",
      "Puedes buscar productos por nombre o descripción usando el buscador en la parte superior",
      "¡Revisa nuestras promociones destacadas!"
    ];
  }

  else if (location.pathname === "/cliente") {
    mensajes = [
      "Hola, soy Nexo, tu asistente virtual. Pulsa el botón de ayuda para consejos útiles.",
      "Explora nuevas categorías de productos",
      "Revisa tus productos en el carrito antes de finalizar tu compra",
      "Puedes filtrar productos por categoría para encontrar lo que buscas más rápido",
      "Puedes buscar productos por nombre o descripción usando el buscador en la parte superior",
      "¡Revisa nuestras promociones destacadas!"
    ];
  }

  else if (location.pathname.includes("/vendedor")) {
    mensajes = [
      "Aquí puedes ver los detalles del producto",
      "Revisa la descripción antes de comprar",
      "Puedes agregarlo al carrito"
    ];
  }

  else if (location.pathname.includes("/product")) {
    mensajes = [
      "Aquí puedes ver los detalles del producto",
      "Revisa la descripción antes de comprar",
      "Puedes agregarlo al carrito"
    ];
  }

  // carrito
  else if (location.pathname.includes("/carrito")) {
    mensajes = [
      "Revisa tus productos antes de comprar",
      "Puedes cambiar cantidades o eliminar productos de la lista",
      "Tu compra es segura con nosotros"
    ];
  }

  // pasarela de pago
  else if (location.pathname.includes("/pasarela-pago")) {
    mensajes = [
      "Completa tus datos de envío y pago para realizar el pedido",
      "Verifica que el resumen del total sea correcto",
      "Procesamos tus datos de forma 100% segura"
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
      "Revisa tus notificaciones",
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

  if (!visible) {
    return (
      <button
        className="mascota-mostrar"
        onClick={() => setVisible(true)}
        title="Mostrar asistente"
      >
        <PawPrint size={24} />
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
            title="Siguiente consejo"
        >
            <HelpCircle size={18} />
        </button>

        <button
            className="mascota-ocultar"
            onClick={() => setVisible(false)}
            title="Ocultar asistente"
        >
            <Minus size={18} />
        </button>
       </div>
    </div>
  );
}