import React from "react";
import "./SeccionCupon.css";

const SeccionCupon = ({
    couponCode,
    setCouponCode,
    couponValidated,
    setCouponValidated,
    couponError,
    setCouponError,
    validatingCoupon,
    handleValidateCoupon,
    discountAmount
}) => {
    return (
        <div className="seccion-cupon-pasarela">
            <label className="etiqueta-cupon">¿Tienes un cupón de descuento?</label>
            <div className="grupo-entrada-cupon">
                <input
                    type="text"
                    placeholder="Ej: NEXO-ABC123"
                    value={couponCode}
                    onChange={e => { 
                        setCouponCode(e.target.value.toUpperCase()); 
                        setCouponError(''); 
                        setCouponValidated(null); 
                    }}
                    disabled={!!couponValidated}
                    className="entrada-cupon"
                />
                {!couponValidated ? (
                    <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="boton-validar-cupon"
                    >
                        {validatingCoupon ? '...' : 'Validar'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => { setCouponValidated(null); setCouponCode(''); }}
                        className="boton-quitar-cupon"
                    >
                        Quitar
                    </button>
                )}
            </div>
            {couponError && <p className="mensaje-error-cupon">{couponError}</p>}
            {couponValidated && (
                <div className="cupon-aplicado-info">
                    <span className="mensaje-exito-cupon">
                        ✅ {couponValidated.descuentoPorcentaje}% de descuento aplicado
                    </span>
                    <span className="monto-descuento-cupon">
                        -₡{discountAmount.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SeccionCupon;
