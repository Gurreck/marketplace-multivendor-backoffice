import React from 'react';
import './ModalLogin.css';

const ModalLogin = ({ isOpen, onClose, onLogin, mensaje }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    
                    <h3>Porfavor inicia sesión</h3>
                </div>
                
                <div className="modal-body">
                    <p>{mensaje || 'Deseas iniciar sesión ahora?'}</p>
                </div>  

                <div className="modal-footer">
                    <button 
                        className="modal-btn modal-btn-primary" 
                        onClick={onLogin}
                    >
                        Iniciar Sesión
                    </button>
                    <button 
                        className="modal-btn modal-btn-secondary" 
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
