import React, { useState, useEffect } from 'react';
import './DireccionEnvio.css';
import { MapPin, Phone, User, CheckCircle } from 'lucide-react';

const DireccionEnvio = ({ onAddressSave, initialAddress, user }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        pais: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        telefono: ''
    });
    const [errors, setErrors] = useState({});
    const [savedAddress, setSavedAddress] = useState(null);
    const [showProfileSuggestion, setShowProfileSuggestion] = useState(false);

    useEffect(() => {
        if (initialAddress) {
            setFormData(initialAddress);
            setSavedAddress(initialAddress);
        }
    }, [initialAddress]);

    useEffect(() => {
        if (initialAddress) {
            setFormData(prev => ({ ...prev, ...initialAddress }));
        }
    }, [initialAddress]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        
        if (!formData.direccion.trim()) {
            newErrors.direccion = 'La dirección es requerida';
        }
        
        if (!formData.pais.trim()) {
            newErrors.pais = 'El país es requerido';
        }
        
        if (!formData.ciudad.trim()) {
            newErrors.ciudad = 'La ciudad es requerida';
        }
        
        if (!formData.provincia.trim()) {
            newErrors.provincia = 'La provincia es requerida';
        }
        
        if (!formData.codigoPostal.trim()) {
            newErrors.codigoPostal = 'El código postal es requerido';
        }
        
        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (!/^\d{8}$/.test(formData.telefono.replace(/\s/g, ''))) {
            newErrors.telefono = 'El teléfono debe tener 8 dígitos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'telefono') {
            const cleanValue = value.replace(/\D/g, '').substring(0, 8);
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setSavedAddress(formData);
            if (onAddressSave) {
                onAddressSave(formData);
            }
        }
    };



    return (
        <div className="direccion-envio">
            <h2 className="titulo-direccion-pasarela">
                <MapPin size={20} style={{ marginRight: '10px' }} /> 
                Dirección de Envío
            </h2>


            
            <form className="formulario-direccion-pasarela" onSubmit={handleSubmit}>
                <div className="campo-formulario">
                    <input
                        type="text"
                        name="nombre"
                        className={`entrada-direccion-pasarela ${errors.nombre ? 'error-entrada' : ''}`}
                        placeholder="Nombre completo"
                        value={formData.nombre}
                        onChange={handleChange}
                    />
                    {errors.nombre && <span className="mensaje-error-direccion-pasarela">{errors.nombre}</span>}
                </div>

                <div className="campo-formulario">
                    <input
                        type="text"
                        name="direccion"
                        className={`entrada-direccion-pasarela ${errors.direccion ? 'error-entrada' : ''}`}
                        placeholder="Dirección exacta (calle, número, edificio)"
                        value={formData.direccion}
                        onChange={handleChange}
                    />
                    {errors.direccion && <span className="mensaje-error-direccion-pasarela">{errors.direccion}</span>}
                </div>

                <div className="campo-formulario">
                    <input
                        type="text"
                        name="pais"
                        className={`entrada-direccion-pasarela ${errors.pais ? 'error-entrada' : ''}`}
                        placeholder="País"
                        value={formData.pais}
                        onChange={handleChange}
                    />
                    {errors.pais && <span className="mensaje-error-direccion-pasarela">{errors.pais}</span>}
                </div>

                <div className="campo-formulario">
                    <input
                        type="text"
                        name="provincia"
                        className={`entrada-direccion-pasarela ${errors.provincia ? 'error-entrada' : ''}`}
                        placeholder="Provincia"
                        value={formData.provincia}
                        onChange={handleChange}
                    />
                    {errors.provincia && <span className="mensaje-error-direccion-pasarela">{errors.provincia}</span>}
                </div>

                <div className="campo-formulario">
                    <input
                        type="text"
                        name="ciudad"
                        className={`entrada-direccion-pasarela ${errors.ciudad ? 'error-entrada' : ''}`}
                        placeholder="Ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                    />
                    {errors.ciudad && <span className="mensaje-error-direccion-pasarela">{errors.ciudad}</span>}
                </div>

                <div className="campo-formulario">
                    <input
                        type="text"
                        name="codigoPostal"
                        className={`entrada-direccion-pasarela ${errors.codigoPostal ? 'error-entrada' : ''}`}
                        placeholder="Código postal"
                        value={formData.codigoPostal}
                        onChange={handleChange}
                    />
                    {errors.codigoPostal && <span className="mensaje-error-direccion-pasarela">{errors.codigoPostal}</span>}
                </div>

                <div className="campo-formulario">
                    <input
                        type="tel"
                        name="telefono"
                        className={`entrada-direccion-pasarela ${errors.telefono ? 'error-entrada' : ''}`}
                        placeholder="Teléfono (8 dígitos)"
                        value={formData.telefono}
                        onChange={handleChange}
                        maxLength={8}
                    />
                    {errors.telefono && <span className="mensaje-error-direccion-pasarela">{errors.telefono}</span>}
                </div>

                <button type="submit" className="boton-guardar-direccion">
                    Guardar Dirección
                </button>
            </form>

            {savedAddress && (
                <div className="direccion-guardada">
                    <h3>Dirección guardada:</h3>
                    <p><strong>{savedAddress.nombre}</strong></p>
                    <p>{savedAddress.direccion}</p>
                    <p>{savedAddress.provincia}, {savedAddress.ciudad} {savedAddress.codigoPostal}</p>
                    {savedAddress.pais && <p>{savedAddress.pais}</p>}
                    <p><Phone size={14} /> {savedAddress.telefono}</p>
                </div>
            )}
        </div>
    );
};

export default DireccionEnvio;
