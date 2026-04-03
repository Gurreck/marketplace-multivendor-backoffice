import React, { useState, useEffect } from 'react';
import './page.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import DivPromo from '../divPromo/divPromo';
import NavbarPrincipal from '../NavbarPrincipal/NavbarPrincipal';
import ModalLogin from '../Modal/ModalLogin';
import { 
  Plus, 
  CheckCircle2, 
  Loader2,
  PackageSearch
} from 'lucide-react';

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
  const [categories, setCategories] = useState(['Todos']);
  
  // Filtros avanzados
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [vendors, setVendors] = useState([]);

  // ===== EFECTOS =====
  /**
   * Carga los productos al montar el componente
   */
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchVendors();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        const catNames = response.data.data
          .filter(c => c.activa)
          .map(c => c.nombre);
        setCategories(['Todos', ...catNames]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback a categorías por defecto
      setCategories(['Todos', 'Computadoras', 'Audio', 'Pantallas', 'Periféricos', 'Tablets', 'Wearables', 'Cámaras', 'Accesorios']);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/products');
      if (response.data.success) {
        const uniqueVendors = [];
        const seen = new Set();
        response.data.data.forEach(p => {
          if (p.vendor && p.vendor._id && !seen.has(p.vendor._id)) {
            seen.add(p.vendor._id);
            uniqueVendors.push({ _id: p.vendor._id, nombre: p.vendor.nombre });
          }
        });
        setVendors(uniqueVendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

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



  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriceMin = !priceMin || product.price >= parseFloat(priceMin);
    const matchesPriceMax = !priceMax || product.price <= parseFloat(priceMax);
    const matchesVendor = !selectedVendor || product.vendor?._id === selectedVendor;
    const matchesStock = !onlyInStock || product.stock > 0;
    return matchesCategory && matchesSearch && matchesPriceMin && matchesPriceMax && matchesVendor && matchesStock;
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
      {showNotification && (
        <div className="notificacion">
          <CheckCircle2 size={18} style={{ marginRight: '8px' }} />
          {showNotification}
        </div>
      )}

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
        priceMin={priceMin}
        setPriceMin={setPriceMin}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        selectedVendor={selectedVendor}
        setSelectedVendor={setSelectedVendor}
        vendors={vendors}
        onlyInStock={onlyInStock}
        setOnlyInStock={setOnlyInStock}
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

          {/* Filtros Avanzados (movidos a NavbarPrincipal) */}

          {/* Listado de Productos (Grid) */}
          {loading ? (
            <div className="contenedor-carga">
              <Loader2 className="animacion-giro" size={40} />
              <p>Cargando productos...</p>
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
                      <button className="boton-agregar" onClick={() => handleAddToCart(product)}>
                        <Plus size={16} />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}




              
            </div>
          ) : (
            /* Estado Vacío */
            <div className="estado-vacio">
              <PackageSearch size={60} opacity={0.3} style={{ marginBottom: '20px' }} />
              <p>No se encontraron productos</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
