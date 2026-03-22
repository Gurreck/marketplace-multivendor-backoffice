import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../resource/logo1.png';
import './NavbarSecunsario.css';

export default function NavbarSecundario({
    user,
    logout,

   

    cartCount,
    // Propiedad opcional para personalizar qué hace el botón Inicio (usada en pageVendedor)
    onInicio,
    // Bloquear el carrito en la página de vendedor
    disableCart,
    disableUserMenu
}) {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Nueva función que intercepta los clics en los botones de "Inicio"
    const handleInicio = () => {
        if (onInicio) {
            // Si nos pasaron una función personalizada desde el padre (ej. pageVendedor), la ejecutamos
            onInicio();
        } else {
            // Si no (ej. en carrito o productos), hace su comportamiento normal: ir a la página principal
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="header-top">
                <div className="header-Marca">
                    <div className="logo" onClick={handleInicio}>
                        <img src={logo} alt="Nexora Logo" className="logo-img-header" />
                        <h1 className="logo-text">Nexora</h1>
                    </div>
                </div>

                <div className="header-barra">
                    <button className="inicio-btn" onClick={handleInicio}>
                        Inicio
                    </button>

                    <button
                        className="theme-toggle-header"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <div className="user-menu" 
                        onClick={() => {
                            if (disableUserMenu) return;
                            if (!user) {
                                navigate('/login');
                            } else if (user?.role === 'vendedor') {
                                navigate('/vendedor/dashboard');
                            }
                        }}
                        style={disableUserMenu ? { cursor: 'default' } : {}}
                    >
                        👤 {user ? (user.nombre || user.email?.split('@')[0]) : 'Iniciar sesión'}
                    </div>
                    <button
                        className="cart-btn"
                        onClick={() => disableCart ? null : navigate('/checkout')}
                        disabled={disableCart}
                        style={disableCart ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        title={disableCart ? "Carrito desactivado para vendedores" : ""}
                    >
                        🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        ✖ Salir
                    </button>
                </div>
            </div>


        </header>
    );
}