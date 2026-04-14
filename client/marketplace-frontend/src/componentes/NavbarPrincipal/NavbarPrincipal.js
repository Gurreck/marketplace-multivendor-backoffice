import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../resource/logo1.png';
import './NavbarPrincipal.css';
import { 
    Search, 
    Sun, 
    Moon, 
    User, 
    ShoppingCart, 
    LogOut 
} from 'lucide-react';

/**
 * NavbarPrincipal
 * Barra de navegación superior principal que incluye búsqueda, perfil de usuario,
 * carrito y selector de categorías.
 */
export default function NavbarPrincipal({
    searchTerm,
    setSearchTerm,
    user,
    logout,
    cartCount,
    isAuthenticated,
    onLoginRequired,
    categories,
    selectedCategory,
    setSelectedCategory,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    selectedVendor,
    setSelectedVendor,
    vendors,
    onlyInStock,
    setOnlyInStock
}) {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    // ===== MANEJADORES DE EVENTOS =====
    /**
     * Cierra la sesión del usuario y redirige al inicio
     */
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // ===== RENDERIZADO =====
    return (
        <header className="encabezado">
            {/* Parte superior: Logo, Buscador y Acciones */}
            <div className="parte-superior-encabezado">
                <div className="izquierda-encabezado">
                    <div className="logotipo" onClick={() => navigate('/')}>
                        <img src={logo} alt="Nexora Logo" className="imagen-logo-encabezado" />
                        <h1 className="texto-logo">Nexora</h1>
                    </div>
                </div>

                <div className="centro-encabezado">
                    <div className="barra-busqueda">
                        <Search className="icono-busqueda" size={20} />
                        <input
                            type="text"
                            placeholder="Busca productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="derecha-encabezado">
                    {/* Alternar Tema */}
                    <button
                        className="alternar-tema-encabezado"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Perfil / Login */}
                    <button className="menu-usuario" onClick={() => {
                        if (!user) {
                            navigate('/login');
                        } else if (user?.role === 'vendedor') {
                            navigate('/vendedor/dashboard');
                        } else if (user?.role === 'administrador') {
                            navigate('/administrador/dashboard');
                        } else {
                            navigate('/cliente/perfil');
                        }
                    }}>
                        {user ? (
                            <img 
                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || user.email)}&background=0094FF&color=fff`} 
                                alt="Perfil" 
                                className="foto-perfil" 
                            />
                        ) : (
                            <User size={20} />
                        )}
                        <div className="info-usuario">
                            <span className="nombre-usuario">
                                {user ? (user.nombre || user.email?.split('@')[0]) : 'Iniciar sesión'}
                            </span>
                            {user && <span className="email-usuario">{user.email}</span>}
                        </div>
                    </button>

                    {/* Carrito */}
                    <button
                        className="boton-carrito"
                        onClick={() => {
                            if (!isAuthenticated) {
                                onLoginRequired();
                                return;
                            }
                            navigate('/carrito');
                        }}
                    >
                        <ShoppingCart size={20} />
                        {cartCount > 0 && <span className="etiqueta-carrito">{cartCount}</span>}
                    </button>
                    <button className="boton-salir" onClick={handleLogout}>
                        <LogOut size={20} style={{ marginRight: '8px' }} />
                        Salir
                    </button>
                </div>
            </div>

            {/* Barra Inferior: Selector de Categorías */}
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

            {/* Filtros Avanzados */}
            <div className="filtros-avanzados-navbar">
                <div className="grupo-filtro-navbar">
                    <label className="etiqueta-filtro-navbar">Precio:</label>
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={priceMin} 
                        onChange={e => setPriceMin(e.target.value)} 
                        className="input-precio-navbar" 
                    />
                    <span className="separador-precio-navbar">-</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={priceMax} 
                        onChange={e => setPriceMax(e.target.value)} 
                        className="input-precio-navbar" 
                    />
                </div>
                <div className="grupo-filtro-navbar">
                    <label className="etiqueta-filtro-navbar">Vendedor:</label>
                    <select 
                        value={selectedVendor} 
                        onChange={e => setSelectedVendor(e.target.value)} 
                        className="select-vendedor-navbar"
                    >
                        <option value="">Todos</option>
                        {vendors?.map(v => <option key={v._id} value={v._id}>{v.nombre}</option>)}
                    </select>
                </div>
                <label className="label-checkbox-navbar">
                    <input 
                        type="checkbox" 
                        checked={onlyInStock} 
                        onChange={e => setOnlyInStock(e.target.checked)} 
                    />
                    Solo disponibles
                </label>
            </div>
        </header>
    );
}

