import React, { useState, useEffect } from "react";
import PublicLayout from "../components/PublicLayout";
import ProductCard from "../components/ProductCard";
import productService from "../services/productService";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products;

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <PublicLayout>
      <div className="hero-section">
        <div className="hero-content">
          <h1>Bienvenido al Marketplace</h1>
          <p>
            Encuentra los mejores productos de nuestros vendedores verificados.
          </p>
        </div>
      </div>
      <div className="container mt-4">
        {/* Filtros */}
        <div className="filters-bar glass-effect mb-4 p-3 rounded">
          <span className="mr-2 font-bold">Categoría:</span>
          <select
            className="form-select inline-block w-auto"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-center w-100 text-muted">
                No hay productos disponibles.
              </p>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default HomePage;
