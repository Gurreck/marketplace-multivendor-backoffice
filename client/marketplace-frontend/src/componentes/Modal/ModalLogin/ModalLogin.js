import React from 'react';
import './ModalLogin.css';
import { LogIn, X } from 'lucide-react';

/**
 * Componente ModalLogin
 * Muestra un cuadro de diálogo para sugerir al usuario que inicie sesión.
 * 
 * @param {boolean} isOpen - Controla si el modal es visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onLogin - Función para redirigir/accionar el login
 * @param {string} mensaje - Mensaje personalizado a mostrar en el cuerpo
 */
const ModalLogin = ({ isOpen, onClose, onLogin, mensaje }) => {
    // Si no está abierto, no renderiza nada
    if (!isOpen) return null;

    return (
        <div className="capa-modal" onClick={onClose}>
            {/* stopPropagation evita que el clic dentro del modal lo cierre */}
            <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado-modal">
                    <LogIn size={24} color="var(--nexora-blue)" />
                    <h3>Inicia Sesión</h3>
                    <button className="boton-cerrar-modal" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="cuerpo-modal">
                    <p>{mensaje || '¿Deseas iniciar sesión ahora?'}</p>
                </div>  

                <div className="pie-modal">
                    <button 
                        className="boton-modal boton-modal-primario" 
                        onClick={onLogin}
                    >
                        Iniciar Sesión
                    </button>
                    <button 
                        className="boton-modal boton-modal-secundario" 
                        onClick={onClose}
                    >
                         Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalLogin;
