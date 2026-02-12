import React from "react";
// import "./ProductTable.css"; // Reuse UserTable styles or add specific ones

const ProductTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="table-container glass-effect">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <div className="product-thumb">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="no-image">No Img</div>
                  )}
                </div>
              </td>
              <td className="fw-500 text-white">{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>
                <span
                  className={`badge ${product.stock > 0 ? "badge-success" : "badge-danger"}`}
                >
                  {product.stock}
                </span>
              </td>
              <td>{product.category}</td>
              <td className="actions-cell">
                <button
                  className="btn-icon edit"
                  onClick={() => onEdit(product)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => onDelete(product._id)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-4">
                No hay productos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
