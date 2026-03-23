import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../resource/logo1.png';
import './NavbarPrincipal.css';

export default function NavbarPrincipal({
    searchTerm,
    setSearchTerm,
    user,
    logout,
    cartCount,
    categories,
    selectedCategory,
    setSelectedCategory
}) {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="encabezado">
            <div className="parte-superior-encabezado">
                <div className="izquierda-encabezado">
                    <div className="logotipo" onClick={() => navigate('/')}>
                        <img src={logo} alt="Nexora Logo" className="imagen-logo-encabezado" />
                        <h1 className="texto-logo">Nexora</h1>
                    </div>
                </div>

                <div className="centro-encabezado">
                    <div className="barra-busqueda">
                        <span className="icono-busqueda">🔍</span>
                        <input
                            type="text"
                            placeholder="Busca productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="derecha-encabezado">
                    <button
                        className="alternar-tema-encabezado"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <button className="menu-usuario" onClick={() => {
                        if (!user) {
                            navigate('/login');
                        } else if (user?.role === 'vendedor') {
                            navigate('/vendedor/dashboard');
                        }
                    }}>
                        👤 {user ? (user.nombre || user.email?.split('@')[0]) : 'Iniciar sesión'}
                    </button>
                    <button
                        className="boton-carrito"
                        onClick={() => navigate('/checkout')}
                    >
                        🛒 {cartCount > 0 && <span className="etiqueta-carrito">{cartCount}</span>}
                    </button>
                    <button className="boton-salir" onClick={handleLogout}>
                        ✖ Salir
                    </button>
                </div>
            </div>

            <div className="barra-categorias">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`boton-categoria ${selectedCategory === category ? 'activo' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </header>
    );
}
