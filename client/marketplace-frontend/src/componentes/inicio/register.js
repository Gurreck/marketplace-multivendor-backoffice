import React, { useState } from 'react';
import './register.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validación
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Por favor, completa todos los campos');
            setLoading(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Por favor, ingresa un email válido');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            // Llamar a la API de registro usando el contexto
            await register(formData.name, formData.email, formData.password);

            alert(`¡Cuenta creada exitosamente! Bienvenido ${formData.name}`);
            setError('');

            // Limpiar formulario y volver al login
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            navigate('/login');

        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`register-container ${!isDarkMode ? 'light-mode' : ''}`}>
            <div className="register-card">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDarkMode ? '☀️' : '🌙'}
                </button>

                <div className="register-icon">
                    <img src={logo} alt="Nexora Logo" className="logo-img" />
                </div>

                <h1 className="register-title">Crear Cuenta</h1>
                <p className="register-subtitle">Únete al marketplace</p>

                {error && <div className="register-error">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="name">
                            <span className="label-icon">👤</span> Nombre completo
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Tu nombre"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            <span className="label-icon">📧</span> Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="tú@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <span className="label-icon">🔐</span> Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            <span className="label-icon">🔐</span> Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Repite tu contraseña"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? '⏳ Creando cuenta...' : '➕ Crear Cuenta'}
                    </button>
                </form>

                <div className="register-footer">
                    <span>¿Ya tienes cuenta? </span>
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        Inicia sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
