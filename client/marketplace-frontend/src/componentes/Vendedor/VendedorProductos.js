import React from "react";
import {
  Package,
  Search,
  PlusCircle,
  AlertCircle,
  Boxes,
  Loader2,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle
} from "lucide-react";
import "./VendedorProductos.css";

export default function VendedorProductos({
  filteredProducts,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  selectedCategory,
  setSelectedCategory,
  categories,
  stockThreshold,
  setStockThreshold,
  openAddModal,
  cargando,
  handleUpdateStock,
  openEditModal,
  handleToggleProduct,
  handleDelete
}) {
  return (
    <>
      <div className="encabezado-pagina-vend">
        <h1>Gestión de Productos</h1>
        <p>Crear, editar, activar/desactivar y gestionar stock</p>
      </div>

      <div className="contenedor-tabla-vend">
        <div className="encabezado-tabla-vend">
          <h3>
            <Package size={18} style={{ marginRight: "8px" }} />
            Mis Productos ({filteredProducts.length})
            {selectedCategory !== "Todos" && ` — ${selectedCategory}`}
          </h3>
          <div className="acciones-tabla-vend">
            <div className="contenedor-entrada-vend">
              <Search size={18} className="icono-entrada-vend" />
              <input
                className="entrada-busqueda-vend"
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select-filtro-vend"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
              <option value="stock_bajo">Stock Bajo</option>
            </select>
            <button className="boton-primario-vend" onClick={openAddModal}>
              <PlusCircle size={18} style={{ marginRight: "8px" }} /> Nuevo
              Producto
            </button>
          </div>
        </div>

        <div className="filtros-categorias-vend">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip-categoria-vend ${selectedCategory === cat ? "activo" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="umbral-stock-vend">
          <AlertCircle size={14} />
          <span>Umbral stock bajo:</span>
          <input
            type="number"
            className="input-umbral-vend"
            value={stockThreshold}
            onChange={(e) => setStockThreshold(Number(e.target.value))}
            min="1"
          />
          <span>unidades</span>
        </div>

        {cargando ? (
          <div className="cargando-vend">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="vacio-vend" style={{ padding: "60px" }}>
            <Boxes size={48} opacity={0.3} />
            <p>No hay productos en esta selección</p>
            <button className="boton-primario-vend" onClick={openAddModal}>
              <PlusCircle size={18} style={{ marginRight: "8px" }} /> Agregar
              Producto
            </button>
          </div>
        ) : (
          <table className="tabla-vend">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="info-producto-vend">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          "https://via.placeholder.com/40"
                        }
                        alt={product.name}
                        className="img-mini-producto"
                      />
                      <div className="detalles-producto-vend">
                        <strong>{product.name}</strong>
                        <span>{product.description?.substring(0, 50)}...</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="insignia-vend blue">
                      {product.category}
                    </span>
                  </td>
                  <td className="monto-vend">
                    ₡{product.price?.toLocaleString()}
                  </td>
                  <td>
                    <div className="control-stock-vend">
                      <input
                        type="number"
                        className="input-stock-vend"
                        defaultValue={product.stock}
                        min="0"
                        onBlur={(e) => {
                          if (Number(e.target.value) !== product.stock) {
                            handleUpdateStock(product, e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                      />
                      {product.stock <= stockThreshold &&
                        product.active !== false && (
                          <AlertTriangle
                            size={14}
                            color="#f59e0b"
                            title="Stock bajo"
                          />
                        )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`insignia-vend ${product.active !== false ? "green" : "red"}`}
                    >
                      {product.active !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="botones-accion-vend">
                      <button
                        className="boton-accion-vend"
                        onClick={() => openEditModal(product)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className={`boton-accion-vend ${product.active !== false ? "warning" : "success"}`}
                        onClick={() => handleToggleProduct(product)}
                        title={
                          product.active !== false ? "Desactivar" : "Activar"
                        }
                      >
                        {product.active !== false ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )}
                      </button>
                      <button
                        className="boton-accion-vend danger"
                        onClick={() => handleDelete(product._id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
