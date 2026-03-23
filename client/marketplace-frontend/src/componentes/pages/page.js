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

/**
 * Principal
 * Componente de la página de inicio (Landing Page) que muestra el catálogo de productos,
 * promociones y permite filtrar por categorías o búsqueda.
 */
export default function Principal() {
  const navigate = useNavigate();
  
  // ===== CONTEXTO =====
  const { logout, user ,isAuthenticated } = useAuth();
  const { addToCart, cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();

  // ===== ESTADO =====
  const [products, setProducts] = useState([]); // Lista completa de productos desde la API
  const [loading, setLoading] = useState(true); // Control de carga inicial de productos
  const [searchTerm, setSearchTerm] = useState(''); // Texto de búsqueda ingresado en el Navbar
  const [selectedCategory, setSelectedCategory] = useState('Todos'); // Categoría activa para el filtro
  const [showNotification, setShowNotification] = useState(''); // Mensaje de éxito al agregar al carrito
  const [showLoginModal, setShowLoginModal] = useState(false); // Visibilidad del modal de login sugerido

  // ===== EFECTOS =====
  /**
   * Carga los productos al montar el componente
   */
  useEffect(() => {
    fetchProducts();
  }, []);

  // ===== CARGA DE DATOS =====
  /**
   * Obtiene todos los productos disponibles desde el servidor
   */
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

  // ===== CONFIGURACIÓN Y FILTRADO =====
  const categories = ['Todos', 'Computadoras', 'Audio', 'Pantallas', 'Periféricos', 'Tablets', 'Wearables', 'Cámaras', 'Accesorios'];

  /**
   * Filtra la lista de productos basada en la categoría seleccionada y el término de búsqueda
   */
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ===== MANEJADORES DE EVENTOS =====
  /**
   * Agrega un producto al carrito, validando sesión previa
   */
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
    setShowNotification(`${product.name} agregado al carrito`);
    setTimeout(() => setShowNotification(''), 3000);
  };

  /**
   * Agrega un producto en oferta al carrito aplicando un descuento del 10%
   */
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

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <div className={`contenedor-principal ${!isDarkMode ? 'modo-claro' : ''}`}>
      {/* Notificación de éxito */}
      {showNotification && <div className="notificacion">✓ {showNotification}</div>}

      {/* Modal Sugerencia Login */}
      <ModalLogin 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate('/login');
        }}
        mensaje="Debes iniciar sesión para agregar productos al carrito"
      />

      {/* Navbar Superior */}
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

      {/* Sección de Promociones */}
      <DivPromo products={products} handlePromoAddToCart={handlePromoAddToCart} />

      <div className="contenedor-mayor">
        <section className="seccion-productos">
          {/* Encabezado del catálogo */}
          <div className="encabezado-seccion">
            <h2>{selectedCategory === 'Todos' ? 'Todos los Productos' : selectedCategory}</h2>
            <p>{filteredProducts.length} productos encontrados</p>
          </div>

          {/* Listado de Productos (Grid) */}
          {loading ? (
            <div className="contenedor-carga">
              <div className="indicador-carga"></div>
              <p>Cargando catálogo...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="rejilla-productos">
              {filteredProducts.map((product) => (
                <div key={product._id || product.id} className="tarjeta-producto">
                  {/* Imagen y Vendedor */}
                  <div className="imagen-producto" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{ cursor: 'pointer' }}>
                    <img src={product.images[0]?.url || "https://via.placeholder.com/300"} alt={product.name} className="imagen-real-producto" />
                    <div className="etiqueta-producto">{product.vendor?.nombre || product.vendor}</div>
                  </div>

                  {/* Detalle y Acción */}
                  <div className="informacion-producto">
                    <h3 className="nombre-producto" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{ cursor: 'pointer' }}>{product.name}</h3>
                    <p className="descripcion-corta-producto">{product.description?.substring(0, 60)}...</p>
                    <p className="vendedor-producto">Vendedor: {product.vendor?.nombre || product.vendor}</p>

                    <div className="pie-producto">
                      <span className="precio-producto">₡{product.price.toLocaleString()}</span>
                      <button className="boton-agregar" onClick={() => handleAddToCart(product)}>➕ Agregar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado Vacío */
            <div className="estado-vacio">
              <p>😔 No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
