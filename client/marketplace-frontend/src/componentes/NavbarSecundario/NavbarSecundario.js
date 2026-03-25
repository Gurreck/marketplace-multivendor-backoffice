import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../resource/logo1.png';
import './NavbarSecunsario.css';
import { 
    Home, 
    Sun, 
    Moon, 
    User, 
    ShoppingCart, 
    LogOut 
} from 'lucide-react';

/**
 * NavbarSecundario
 * Una versión simplificada de la barra de navegación utilizada en páginas como
 * el carrito, la vista de producto o el panel de vendedor.
 */
export default function NavbarSecundario({
    user,
    logout,
    cartCount,
    onInicio,
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

    const handleInicio = () => {
        if (onInicio) {
            onInicio();
        } else {
            navigate('/');
        }
    };

    // ===== RENDERIZADO =====
    return (
        <div className={`barra-navegacion-secundaria ${!isDarkMode ? 'modo-claro' : ''}`}>
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
                        <Home size={18} style={{ marginRight: '8px' }} />
                        Inicio
                    </button>

                    {/* Alternar Tema */}
                    <button
                        className="alternar-tema-encabezado"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
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
                                navigate('/cliente/perfil');
                            }
                        }}
                        style={disableUserMenu ? { cursor: 'default' } : {}}
                    >
                        {user ? (
                            <img 
                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || user.email)}&background=0094FF&color=fff`} 
                                alt="Perfil" 
                                className="foto-perfil" 
                            />
                        ) : (
                            <User size={18} />
                        )}
                        <div className="info-usuario">
                            <span className="nombre-usuario">
                                {user ? (user.nombre || user.email?.split('@')[0]) : 'Iniciar sesión'}
                            </span>
                            {user && <span className="email-usuario">{user.email}</span>}
                        </div>
                    </div>

                    {/* Carrito */}
                    <button
                        className="boton-carrito"
                        onClick={() => disableCart ? null : navigate('/checkout')}
                        disabled={disableCart}
                        style={disableCart ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        title={disableCart ? "Carrito desactivado para vendedores" : ""}
                    >
                        <ShoppingCart size={20} />
                        {cartCount > 0 && <span className="etiqueta-carrito">{cartCount}</span>}
                    </button>
                    <button className="boton-salir" onClick={handleLogout}>
                        <LogOut size={18} style={{ marginRight: '8px' }} />
                        Salir
                    </button>
                </div>
            </div>
            </header>
        </div>
    );
}