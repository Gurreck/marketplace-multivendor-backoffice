import React, { useState, useEffect } from "react";
// import "./ProductModal.css"; // Vamos a necesitar estilos específicos o usar App.css

const ProductModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "", // Simplificado a una sola imagen por ahora
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description,
        price: productToEdit.price,
        category: productToEdit.category,
        stock: productToEdit.stock,
        image:
          productToEdit.images && productToEdit.images.length > 0
            ? productToEdit.images[0]
            : "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: "",
      });
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convertir precio y stock a números
    const dataToSave = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: [formData.image], // Enviar como array
    };
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-effect">
        <div className="modal-header">
          <h2>{productToEdit ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Seleccionar...</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Ropa">Ropa</option>
              <option value="Hogar">Hogar</option>
              <option value="Deportes">Deportes</option>
              <option value="Libros">Libros</option>
            </select>
          </div>

          <div className="form-group">
            <label>URL de Imagen</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              placeholder="https://ejemplo.com/imagen.jpg"
              className="input-field"
            />
          </div>

          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Vista previa" />
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
