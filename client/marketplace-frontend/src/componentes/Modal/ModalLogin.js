import React from 'react';
import './ModalLogin.css';
import { LogIn, X } from 'lucide-react';

const ModalLogin = ({ isOpen, onClose, onLogin, mensaje }) => {
    if (!isOpen) return null;

    return (
        <div className="capa-modal" onClick={onClose}>
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
