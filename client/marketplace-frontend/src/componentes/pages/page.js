import React, { useState, useEffect } from 'react';
import './page.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export default function Principal() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showNotification, setShowNotification] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [promoProducts, setPromoProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica para rotar productos de promoción cada 30 segundos
  useEffect(() => {
    if (products.length === 0) return;

    const getRandomProducts = () => {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2);
    };

    setPromoProducts(getRandomProducts());

    const interval = setInterval(() => {
      setPromoProducts(getRandomProducts());
    }, 30000);

    return () => clearInterval(interval);
  }, [products]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const categories = ['Todos', 'Computadoras', 'Audio', 'Pantallas', 'Periféricos', 'Tablets', 'Wearables', 'Cámaras', 'Accesorios'];

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowNotification(`${product.name} agregado al carrito`);
    setTimeout(() => setShowNotification(''), 3000);
  };

  const handlePromoAddToCart = (product) => {
    const discountedProduct = {
      ...product,
      originalPrice: product.price,
      price: Math.floor(product.price * 0.90),
      isPromo: true
    };
    addToCart(discountedProduct);
    setShowNotification(`${product.name} (Oferta 10%) agregado al carrito`);
    setTimeout(() => setShowNotification(''), 3000);
  };

  return (
    <div className={`principal-container ${!isDarkMode ? 'light-mode' : ''}`}>
      {showNotification && <div className="notification">{showNotification}</div>}

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
              if (user?.role === 'vendedor') navigate('/vendedor/dashboard');
            }}>
              👤 {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}
            </button>
            <button
              className="cart-btn"
              onClick={() => navigate('/checkout')}
            >
              🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="logout-btn" onClick={() => {
              logout();
              navigate('/login');
            }}>
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

      <section className="promo-banner">
        <div className="promo-content">
          <div className="promo-text-side">
            <p className="promo-subtitle">— Bueno, Bonito, Barato —</p>
            <h2 className="promo-title">HASTA <span className="highlight">10% EN PRODUCTOS</span></h2>
          </div>

          <div className="promo-products-side">
            {promoProducts.map((product, index) => (
              <div
                key={`${product._id || product.id}-${index}`}
                className="promo-mini-card clickeable"
                onClick={() => handlePromoAddToCart(product)}
              >
                <div className="mini-card-image">
                  <img src={product.images[0]} alt={product.name} />
                </div>
                <div className="mini-card-footer">
                  <span className="mini-price-original">₡ {product.price.toLocaleString()}</span>
                  <span className="mini-price">₡ {Math.floor(product.price * 0.90).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="main-container">
        <section className="products-section">
          <div className="section-header">
            <h2>{selectedCategory === 'Todos' ? 'Todos los Productos' : selectedCategory}</h2>
            <p>{filteredProducts.length} productos</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product._id || product.id} className="product-card">
                  <div className="product-image" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{ cursor: 'pointer' }}>
                    <img src={product.images[0]} alt={product.name} className="product-real-image" />
                    <div className="product-badge">{product.vendor?.nombre || product.vendor}</div>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{ cursor: 'pointer' }}>{product.name}</h3>
                    <p className="product-short-desc">{product.description?.substring(0, 60)}...</p>
                    <p className="product-vendor">por {product.vendor?.nombre || product.vendor}</p>

                    <div className="product-footer">
                      <span className="product-price">${product.price}</span>
                      <button className="add-btn" onClick={() => handleAddToCart(product)}>➕ Agregar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>😔 No se encontraron productos</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
