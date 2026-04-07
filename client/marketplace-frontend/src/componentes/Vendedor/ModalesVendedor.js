import React from "react";
import { X, Pencil, PlusCircle, Briefcase, Boxes, Tag, Image as ImageIcon, UploadCloud } from "lucide-react";
import "./ModalesVendedor.css";

export function ModalesVendedor({
  isModalOpen,
  setIsModalOpen,
  editingProduct,
  handleSubmit,
  formData,
  handleInputChange,
  categories,
  existingImages,
  removeExistingImage,
  imagePreviews,
  removeNewImage,
  handleFileSelect
}) {
  if (!isModalOpen) return null;

  return (
    <div className="superposicion-modal-vend">
      <div className="modal-vend">
        <div className="encabezado-modal-vend">
          <h2>
            {editingProduct ? (
              <>
                <Pencil
                  size={20}
                  style={{ marginRight: "10px", verticalAlign: "middle" }}
                />
                Editar Producto
              </>
            ) : (
              <>
                <PlusCircle
                  size={20}
                  style={{ marginRight: "10px", verticalAlign: "middle" }}
                />
                Subir Nuevo Producto
              </>
            )}
          </h2>
          <button
            className="cerrar-modal-vend"
            onClick={() => setIsModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <form className="formulario-vend" onSubmit={handleSubmit}>
          <div className="grupo-formulario-vend">
            <label>
              <Briefcase size={14} style={{ marginRight: "6px" }} /> Nombre
              del Producto
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Laptop Dell XPS 15"
              required
            />
          </div>

          <div className="grupo-formulario-vend">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe las características principales..."
              rows="4"
              required
            />
          </div>

          <div className="fila-formulario-vend">
            <div className="grupo-formulario-vend">
              <label>Precio (₡)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="grupo-formulario-vend">
              <label>
                <Boxes size={14} style={{ marginRight: "6px" }} /> Stock
                Disponible
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="fila-formulario-vend">
            <div className="grupo-formulario-vend">
              <label>
                <Tag size={14} style={{ marginRight: "6px" }} /> Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories
                  .filter((c) => c !== "Todos")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grupo-formulario-vend">
              <label>Marca (Opcional)</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Ej: Dell, Sony..."
              />
            </div>
          </div>

          <div className="grupo-formulario-vend">
            <label>
              <ImageIcon size={14} style={{ marginRight: "6px" }} />{" "}
              Imágenes del Producto
            </label>

            {existingImages.length > 0 && (
              <div className="contenedor-vistas-previas-vend">
                <p className="subtitulo-imagenes-vend">
                  Imágenes actuales:
                </p>
                <div className="cuadricula-vistas-previas-vend">
                  {existingImages.map((img, index) => (
                    <div
                      key={`existing-${index}`}
                      className="item-vista-previa-vend"
                    >
                      <img src={img.url} alt={`Existente ${index + 1}`} />
                      <button
                        type="button"
                        className="boton-quitar-vista-previa-vend"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="contenedor-vistas-previas-vend">
                <p className="subtitulo-imagenes-vend">Nuevas imágenes:</p>
                <div className="cuadricula-vistas-previas-vend">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="item-vista-previa-vend"
                    >
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="boton-quitar-vista-previa-vend"
                        onClick={() => removeNewImage(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="area-carga-archivos-vend">
              <label className="boton-carga-archivos-vend">
                <UploadCloud size={20} style={{ marginRight: "10px" }} />
                Seleccionar imágenes
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </label>
              <span className="sugerencia-carga-vend">
                Máx. 5 imágenes (JPEG, PNG, GIF, WebP) — 5MB c/u
              </span>
            </div>
          </div>

          <div className="acciones-formulario-vend">
            <button
              type="button"
              className="boton-cancelar-vend"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="boton-enviar-vend">
              {editingProduct ? "Guardar Cambios" : "Publicar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
