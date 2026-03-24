import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../resource/logo1.png';
import './NavbarSecunsario.css';

/**
 * NavbarSecundario
 * Una versión simplificada de la barra de navegación utilizada en páginas como
 * el carrito, la vista de producto o el panel de vendedor.
 */
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

    // ===== MANEJADORES DE EVENTOS =====
    /**
     * Cierra la sesión y redirige al inicio
     */
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    /**
     * Intercepta los clics en el botón "Inicio" para permitir comportamiento personalizado
     */
    const handleInicio = () => {
        if (onInicio) {
            // Si nos pasaron una función personalizada desde el padre (ej. pageVendedor), la ejecutamos
            onInicio();
        } else {
            // Comportamiento normal: ir a la página principal
            navigate('/');
        }
    };

    // ===== RENDERIZADO =====
    return (
        <header className="encabezado">
            <div className="parte-superior-encabezado">
                <div className="marca-encabezado">
                    <div className="logotipo" onClick={() => navigate('/')}>
                        <img src={logo} alt="Nexora Logo" className="imagen-logo-encabezado" />
                        <h1 className="texto-logo">Nexora</h1>
                    </div>
                </div>

                <div className="barra-encabezado">
                    {/* Botón Inicio con lógica personalizada */}
                    <button className="boton-inicio" onClick={handleInicio}>
                        Inicio
                    </button>

                    {/* Alternar Tema */}
                    <button
                        className="alternar-tema-encabezado"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>

                    {/* Menú de Usuario / Login */}
                    <div className="menu-usuario" 
                        onClick={() => {
                            if (disableUserMenu) return;
                            if (!user) {
                                navigate('/login');
                            } else if (user?.role === 'vendedor') {
                                navigate('/vendedor/dashboard');
                            } else if (user?.role === 'administrador') {
                                navigate('/admin/dashboard');
                            } else {
                                navigate('/cliente');
                            }
                        }}
                        style={disableUserMenu ? { cursor: 'default' } : {}}
                    >
                        👤 {user ? (user.nombre || user.email?.split('@')[0]) : 'Iniciar sesión'}
                    </div>

                    {/* Carrito */}
                    <button
                        className="boton-carrito"
                        onClick={() => disableCart ? null : navigate('/checkout')}
                        disabled={disableCart}
                        style={disableCart ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        title={disableCart ? "Carrito desactivado para vendedores" : ""}
                    >
                        🛒 {cartCount > 0 && <span className="etiqueta-carrito">{cartCount}</span>}
                    </button>

                    {/* Salir */}
                    <button className="boton-salir" onClick={handleLogout} title="Cerrar sesión">
                        ✖ Salir
                    </button>
                </div>
            </div>
        </header>
    );
}