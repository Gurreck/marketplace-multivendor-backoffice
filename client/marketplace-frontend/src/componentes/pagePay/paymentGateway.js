
import React, { useState, useEffect } from "react";
import "./paymentGateway.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import NavbarSecundario from "../NavbarSecundario/NavbarSecundario";
import Address from "../Address/Address";
import CardPay from "../Card-Pay/CardPay";
import { CheckCircle2, X } from 'lucide-react';

const PaymentGateway = () => {
  // ===== NAVEGACIÓN Y CONTEXTO =====
  const navigate = useNavigate();
  const location = useLocation();

  const { clearCart, cartTotal, cartCount } = useCart();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const selectedItems = location.state?.selectedItems || [];
  const selectedSubtotal = location.state?.selectedSubtotal || cartTotal;

  const [shippingAddress, setShippingAddress] = useState(null);
  
  // Estado para autocompletar desde el Modal
  const [showSavedDataModal, setShowSavedDataModal] = useState(false);
  const [initialAddressData, setInitialAddressData] = useState(null);
  const [initialCardData, setInitialCardData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Mostrar modal si el usuario tiene info guardada y aún no ha tomado una decisión
      if ((user.shippingAddress?.direccion || user.debitCard?.cardNumber) && !initialAddressData && !initialCardData) {
        setShowSavedDataModal(true);
      }
    }
  }, [user, navigate]);

  const handleUseSavedData = () => {
    if (user?.shippingAddress) {
      setInitialAddressData({
        nombre: user.nombre || '',
        direccion: user.shippingAddress.direccion || '',
        pais: user.shippingAddress.pais || '',
        ciudad: user.shippingAddress.ciudad || '',
        provincia: user.shippingAddress.provincia || '',
        codigoPostal: user.shippingAddress.codigoPostal || '',
        telefono: user.telefono || ''
      });
    }
    if (user?.debitCard) {
      setInitialCardData(user.debitCard);
    }
    setShowSavedDataModal(false);
  };

  const handleRejectSavedData = () => {
    setShowSavedDataModal(false);
  };

  const handleAddressSave = (address) => {
    setShippingAddress(address);
  };

  const handlePaymentSuccess = (lastFourDigits, shouldClearCart = false, createdOrder = null) => {
    if (shouldClearCart) {
      clearCart();
      if (createdOrder) {
        navigate("/rastreo", { state: { order: createdOrder } });
      } else {
        navigate("/");
      }
    }
  };

  const handleContinue = () => {
    clearCart();
    navigate("/");
  };

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <>
      <div
        className={`barra-navegacion-secundaria ${!isDarkMode ? "modo-claro" : ""}`}
      >
        <NavbarSecundario
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          user={user}
          logout={logout}
        />
      </div>

      {/* MODAL DE DATOS GUARDADOS */}
      {showSavedDataModal && (
        <div className="capa-modal-datos-guardados">
          <div className="modal-datos-guardados">
            <button className="boton-cerrar-modal-datos" onClick={handleRejectSavedData}>
              <X size={24} />
            </button>
            <div className="icono-modal-datos">
              <CheckCircle2 size={50} color="white" />
            </div>
            <h2>¡Hola {user?.nombre?.split(' ')[0] || ''}!</h2>
            <p>
              Hemos detectado que tienes 
              {user?.shippingAddress?.direccion && user?.debitCard?.cardNumber 
                ? " una dirección de envío y una tarjeta guardadas " 
                : user?.shippingAddress?.direccion 
                  ? " una dirección de envío guardada " 
                  : " una tarjeta guardada "} 
              en tu perfil. ¿Deses utilizar estos datos para agilizar tu compra?
            </p>
            <div className="acciones-modal-datos">
              <button className="boton-usar-datos" onClick={handleUseSavedData}>
                Usar mis datos
              </button>
              <button className="boton-no-usar-datos" onClick={handleRejectSavedData}>
                Ingresarlos manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`contenedor-pasarela ${!isDarkMode ? "modo-claro" : ""}`}>
        <div className="contenido-principal-pasarela">
          <div className="diseno-dos-columnas-pasarela">
            <div className="columna-derecha-pasarela">
              <CardPay
                selectedSubtotal={selectedSubtotal}
                selectedItems={selectedItems}
                address={shippingAddress}
                initialCard={initialCardData}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
            <div className="columna-izquierda-pasarela">
              <Address 
                onAddressSave={handleAddressSave} 
                initialAddress={initialAddressData}
                user={user} 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentGateway;

