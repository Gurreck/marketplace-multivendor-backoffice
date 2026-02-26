import React, { useState } from 'react';
import './page.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';

export default function Principal() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToCart, cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cartOpen, setCartOpen] = useState(false);
  const [showNotification, setShowNotification] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className={`principal-container ${!isDarkMode ? 'light-mode' : ''}`}>
      {/* Header/Navbar */}
      <header className="header">
        <div className="header-top">
          <div className="header-left">
            <div className="logo">
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
            <button className="user-menu">
              👤 {user?.email?.split('@')[0] || 'Usuario'}
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

        {/* Categorías */}
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

      {/* Notificación */}
      {showNotification && (
        <div className="notification">
          ✓ {showNotification}
        </div>
      )}

      <div className="main-container">
        {/* Productos Grid */}
        <section className="products-section">
          <div className="section-header">
            <h2>
              {selectedCategory === 'Todos' ? 'Todos los Productos' : selectedCategory}
            </h2>
            <p>{filteredProducts.length} productos</p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="product-real-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{ display: 'none' }} className="product-image-fallback">
                      📦
                    </div>
                    <div className="product-badge">{product.vendor}</div>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>{product.name}</h3>
                    <p className="product-short-desc">{product.shortDescription}</p>
                    <p className="product-vendor">por {product.vendor}</p>

                    <div className="product-rating">
                      <span className="stars">⭐</span>
                      <span className="rating-value">{product.rating}</span>
                    </div>

                    <div className="product-footer">
                      <span className="product-price">${product.price}</span>
                      <button
                        className="add-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        ➕ Agregar
                      </button>
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

        {/* Carrito     vista del carrito previa*/}
        {(cartOpen || cartItems.length > 0) && (
          <aside className="cart-panel">
            <div className="cart-header">
              <h2>🛒 Tu Carrito</h2>
            </div>

            {cartItems.length > 0 ? (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-emoji">📦</span>
                        <div>
                          <p className="cart-item-name">{item.name}</p>
                          <p className="cart-item-price">${item.price}</p>
                        </div>
                      </div>

                      <div className="cart-item-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-subtotal">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>



                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceder al Pago
                </button>
              </>
            ) : (
              <div className="empty-cart">
                <p>Tu carrito está vacío</p>
                <p>😢 Agrega productos para comenzar a comprar</p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
