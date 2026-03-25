import React, { useState } from 'react';
import './paymentGateway.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import Address from '../Address/Address';
import CardPay from '../Card-Pay/CardPay';

const PaymentGateway = () => {
    // ===== NAVEGACIÓN Y CONTEXTO =====
    const navigate = useNavigate();
    const location = useLocation();

    const { clearCart, cartTotal, cartCount } = useCart();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const selectedItems = location.state?.selectedItems || [];
    const selectedSubtotal = location.state?.selectedSubtotal || cartTotal;

    const handlePaymentSuccess = (lastFourDigits, shouldClearCart = false) => {
        if (shouldClearCart) {
            clearCart();
            navigate('/');
        }
    };

    const handleContinue = () => {
        clearCart();
        navigate('/');
    };

    // ===== RENDERIZADO PRINCIPAL =====
    return (
        <>
            <div className={`barra-navegacion-secundaria ${!isDarkMode ? 'modo-claro' : ''}`}>
                <NavbarSecundario
                    toggleTheme={toggleTheme}
                    isDarkMode={isDarkMode}
                    user={user}
                    logout={logout}
                    cartCount={cartCount}
                />
            </div>

            <div className={`contenedor-pasarela ${!isDarkMode ? 'modo-claro' : ''}`}>
                <div className="contenido-principal-pasarela">
                    <div className="diseno-dos-columnas-pasarela">
                        

                        <div className="columna-derecha-pasarela">
                            <CardPay 
                                selectedSubtotal={selectedSubtotal}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentGateway;

