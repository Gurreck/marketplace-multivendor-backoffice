import React, { useState } from 'react';
import './ProductoGaleria.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../VistaProducto/VistaProducto.css';

/**
 * Componente de galería de imágenes del producto con carrusel.
 */
export default function ProductoGaleria({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="galeria-producto">
                <img src="https://via.placeholder.com/500" alt="Sin imagen" className="imagen-principal" />
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="galeria-producto">
            <div className="contenedor-imagen-principal">
                <img
                    src={images[currentIndex]?.url || images[currentIndex]}
                    alt={`Producto imagen ${currentIndex + 1}`}
                    className="imagen-principal"
                />
                {images.length > 1 && (
                    <>
                        <button className="boton-galeria anterior" onClick={prevImage}>
                            <ChevronLeft size={24} />
                        </button>
                        <button className="boton-galeria siguiente" onClick={nextImage}>
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>
            {images.length > 1 && (
                <div className="miniaturas-galeria">
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img?.url || img}
                            alt={`Miniatura ${i + 1}`}
                            className={`miniatura ${i === currentIndex ? 'activa' : ''}`}
                            onClick={() => setCurrentIndex(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

