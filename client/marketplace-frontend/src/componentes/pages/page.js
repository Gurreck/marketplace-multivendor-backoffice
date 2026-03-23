import React, { useState, useEffect } from 'react';
import './page.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import DivPromo from '../divPromo/divPromo';
import NavbarPrincipal from '../NavbarPrincipal/NavbarPrincipal';
import ModalLogin from '../Modal/ModalLogin';

export default function Principal() {
  const navigate = useNavigate();
  const { logout, user ,isAuthenticated } = useAuth();
  const { addToCart, cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showNotification, setShowNotification] = useState('');
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
    <div className={`contenedor-principal ${!isDarkMode ? 'modo-claro' : ''}`}>
      {showNotification && <div className="notificacion">{showNotification}</div>}

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

      <div className="contenedor-mayor">
        <section className="seccion-productos">
          <div className="encabezado-seccion">
            <h2>{selectedCategory === 'Todos' ? 'Todos los Productos' : selectedCategory}</h2>
            <p>{filteredProducts.length} productos</p>
          </div>

          {loading ? (
            <div className="contenedor-carga">
              <div className="indicador-carga"></div>
              <p>Cargando productos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="rejilla-productos">
              {filteredProducts.map((product) => (
                <div key={product._id || product.id} className="tarjeta-producto">
                  <div className="imagen-producto" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{ cursor: 'pointer' }}>
                    <img src={product.images[0]?.url || "https://via.placeholder.com/300"} alt={product.name} className="imagen-real-producto" />
                    <div className="etiqueta-producto">{product.vendor?.nombre || product.vendor}</div>
                  </div>

                  <div className="informacion-producto">
                    <h3 className="nombre-producto" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{ cursor: 'pointer' }}>{product.name}</h3>
                    <p className="descripcion-corta-producto">{product.description?.substring(0, 60)}...</p>
                    <p className="vendedor-producto">vendedor: {product.vendor?.nombre || product.vendor}</p>

                    <div className="pie-producto">
                      <span className="precio-producto">₡{product.price.toLocaleString()}</span>
                      <button className="boton-agregar" onClick={() => handleAddToCart(product)}>➕ Agregar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="estado-vacio">
              <p>😔 No se encontraron productos</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
