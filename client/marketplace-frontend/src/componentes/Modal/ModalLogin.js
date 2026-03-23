import React from 'react';
import './ModalLogin.css';

const ModalLogin = ({ isOpen, onClose, onLogin, mensaje }) => {
    if (!isOpen) return null;

    return (
        <div className="capa-modal" onClick={onClose}>
            <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado-modal">
                    
                    <h3>Porfavor inicia sesión</h3>
                </div>
                
                <div className="cuerpo-modal">
                    <p>{mensaje || 'Deseas iniciar sesión ahora?'}</p>
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
