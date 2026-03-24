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
                    <button className="boton-inicio" onClick={handleInicio}>
                        <Home size={18} style={{ marginRight: '8px' }} />
                        Inicio
                    </button>

                    <button
                        className="alternar-tema-encabezado"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="menu-usuario" 
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
                        <User size={18} style={{ marginRight: '8px' }} />
                        <span className="nombre-usuario">
                            {user ? (user.nombre || user.email?.split('@')[0]) : 'Iniciar sesión'}
                        </span>
                    </div>
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
    );
}