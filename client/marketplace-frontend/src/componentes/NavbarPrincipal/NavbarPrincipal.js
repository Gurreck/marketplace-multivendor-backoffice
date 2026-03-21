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
        <header className="header">
            <div className="header-top">
                <div className="header-left">
                    <div className="logo" onClick={() => navigate('/')}>
                        <img src={logo} alt="Nexora Logo" className="logo-img-header" />
                        <h1 className="logo-text">Nexora</h1>
                    </div>
                </div>

                <div className="header-center">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Busca productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="header-right">
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
                    <button className="logout-btn" onClick={handleLogout}>
                        ✖ Salir
                    </button>
                </div>
            </div>

            <div className="categories-bar">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </header>
    );
}
