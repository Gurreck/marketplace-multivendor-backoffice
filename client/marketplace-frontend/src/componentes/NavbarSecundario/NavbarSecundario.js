import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../resource/logo1.png';
import './NavbarSecunsario.css';

export default function NavbarSecundario({
    toggleTheme,
    isDarkMode,
    user,
    logout,
    cartCount



}) {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="header-top">
                <div className="header-Marca">
                    <div className="logo" onClick={() => navigate('/')}>
                        <img src={logo} alt="Nexora Logo" className="logo-img-header" />
                        <h1 className="logo-text">Nexora</h1>
                    </div>
                </div>

                <div className="header-barra">
                    <button className="inicio-btn" onClick={() => navigate('/')}>
                        Inicio
                    </button>

                    <button
                        className="theme-toggle-header"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <button className="user-menu" onClick={() => {
                        if (!user) {
                            navigate('/login');
                        } else if (user?.role === 'vendedor') {
                            navigate('/vendedor/dashboard');
                        }
                    }}>
                        👤 {user ? (user.nombre || user.email?.split('@')[0]) : 'Iniciar sesión'}
                    </button>
                    <button
                        className="cart-btn"
                        onClick={() => navigate('/checkout')}
                    >
                        🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                    <button className="logout-btn" onClick={() => {
                        logout();
                        navigate('/');
                    }}>
                        ✖ Salir
                    </button>
                </div>
            </div>


        </header>
    );
}