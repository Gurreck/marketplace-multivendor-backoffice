import React from "react";
import { Trash2, Star, Loader2 } from "lucide-react";
import "./Productos.css";

const Productos = ({
  cartItems,
  selectedItems,
  toggleSelection,
  toggleSelectAll,
  isAllSelected,
  handleRemove,
  updateQuantity,
  loadingComments,
  productComments,
  getItemId
}) => {
  return (
    <div className="columna-productos">
      <div className="barra-seleccion">
        <div className="grupo-seleccionar-todo">
          <input 
            type="checkbox" 
            checked={isAllSelected} 
            onChange={toggleSelectAll} 
          />
          <span onClick={toggleSelectAll}>
            Seleccionar todo ({cartItems.length})
          </span>
        </div>
        <div className="estadisticas-seleccion">
          <span>Sugeridos ({cartItems.length})</span>
          <span className="seleccion-activa">
            Seleccionado ({cartItems.filter(item => selectedItems[getItemId(item)]).length})
          </span>
        </div>
      </div>

      <div className="lista-items-pago">
        {cartItems.map((item) => (
          <div
            key={getItemId(item)}
            className={`fila-item-pago ${!selectedItems[getItemId(item)] ? "atenuado" : ""}`}
          >
            <div className="casilla-item">
              <input
                type="checkbox"
                checked={!!selectedItems[getItemId(item)]}
                onChange={() => toggleSelection(getItemId(item))}
              />
            </div>

            <div className="informacion-principal-item">
              <div className="caja-imagen-item">
                <img
                  src={
                    item.product?.images?.[0]?.url ||
                    item.images?.[0]?.url ||
                    item.product?.images?.[0] ||
                    item.images?.[0] ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.product?.name || item.name}
                />
              </div>
              <div className="caja-detalles-item">
                <h4 className="nombre-item-pago">{item.product?.name || item.name}</h4>

                {loadingComments ? (
                  <div className="cargando-calificacion-item">
                    <Loader2 className="animacion-giro" size={14} /> Cargando...
                  </div>
                ) : productComments[getItemId(item)]?.count > 0 ? (
                  <div className="seccion-calificacion-item">
                    <div className="estrellas-calificacion-item">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={
                            i < Math.round(productComments[getItemId(item)]?.averageRating || 0)
                              ? "var(--admin-advertencia)"
                              : "none"
                          }
                          color={
                            i < Math.round(productComments[getItemId(item)]?.averageRating || 0)
                              ? "var(--admin-advertencia)"
                              : "#ccc"
                          }
                        />
                      ))}
                    </div>
                    <span className="numero-calificacion-item">
                      {productComments[getItemId(item)]?.averageRating || "0"}
                    </span>
                    <span className="conteo-calificacion-item">
                      ({productComments[getItemId(item)]?.count || 0} opiniones)
                    </span>
                  </div>
                ) : (
                  <div className="item-sin-comentarios">
                    <Star size={14} style={{ marginRight: "4px" }} /> Este producto aún no tiene opiniones
                  </div>
                )}

                {(item.product?.description || item.description) && (
                  <p className="descripcion-item-pago">
                    {item.product?.description || item.description}
                  </p>
                )}

                <div className="vendedor-item-pago">
                  <span className="etiqueta-vendedor">Vendedor:</span>{" "}
                  <strong>
                    {item.product?.vendor?.nombre ||
                     item.product?.vendor ||
                     item.vendor?.nombre ||
                     item.vendor ||
                     "—"}
                  </strong>
                </div>

                <div className="fila-precio-item">
                  {item.originalPrice ? (
                    <div className="pila-precio-pago">
                      <span className="precio-anterior-pago">
                        ₡ {item.originalPrice.toLocaleString()}
                      </span>
                      <div className="fila-precio-actual">
                        <span className="precio-actual">
                          ₡ {item.price.toLocaleString()}
                        </span>
                        <span className="etiqueta-descuento-pago">
                          -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="precio-actual">
                      ₡ {item.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="caja-acciones-item">
              <button
                className="boton-eliminar-item"
                onClick={() => handleRemove(getItemId(item))}
              >
                <Trash2 size={18} />
              </button>
              <div className="selector-cantidad-pago">
                <span>Cant. </span>
                <input
                  type="number"
                  min="1"
                  max={item.product?.stock || item.stock || 999}
                  value={item.quantity}
                  className="input-cantidad"
                  onChange={(e) => {
                    const stock = item.product?.stock || item.stock || 999;
                    const newValue = Math.min(Math.max(1, parseInt(e.target.value) || 1), stock);
                    updateQuantity(getItemId(item), newValue);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;
