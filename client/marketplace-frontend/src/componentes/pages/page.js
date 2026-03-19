import React, { useState, useEffect } from 'react';
import './page.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import DivPromo from '../divPromo/divPromo';
import NavbarPrincipal from '../NavbarPrincipal/NavbarPrincipal';
import ModalLogin from '../Modal/ModalLogin';

export default function Principal() {
  const navigate = useNavigate();
  const { logout, user ,isAuthenticated } = useAuth();
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showNotification, setShowNotification] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
    setShowNotification(`${product.name} agregado al carrito`);
    setTimeout(() => setShowNotification(''), 3000);
  };

  const handlePromoAddToCart = (product) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
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

      <ModalLogin 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate('/login');
        }}
        mensaje="Debes iniciar sesión para agregar productos al carrito"
      />

      <NavbarPrincipal
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        user={user}
        logout={logout}
        cartCount={cartCount}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <DivPromo products={products} handlePromoAddToCart={handlePromoAddToCart} />

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
                    <p className="product-vendor">vendedor: {product.vendor?.nombre || product.vendor}</p>

                    <div className="product-footer">
                      <span className="product-price">₡{product.price.toLocaleString()}</span>
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
