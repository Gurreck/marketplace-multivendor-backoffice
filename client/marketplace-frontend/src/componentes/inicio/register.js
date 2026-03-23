import React, { useState } from 'react';
import './register.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // ===== ESTADO =====
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'cliente'
    }); // Datos del formulario
    const [error, setError] = useState(''); // Mensajes de error
    const [loading, setLoading] = useState(false); // Estado de carga (submitting)
    const [isDarkMode, setIsDarkMode] = useState(true); // Tema local
    const [showPassword, setShowPassword] = useState(false); // Visibilidad contraseña
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Visibilidad confirmación

    // ===== MANEJADORES DE EVENTOS =====
    /**
     * Alterna el tema entre claro y oscuro
     */
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    /**
     * Actualiza el estado del formulario al escribir
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Procesa el registro del usuario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validación
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
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
            await register(formData.name, formData.email, formData.password, formData.role);
            alert(`¡Cuenta creada exitosamente! Bienvenido ${formData.name}`);
            setError('');
            setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'cliente' });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // ===== RENDERIZADO =====
    return (
        <div className={`contenedor-registro ${!isDarkMode ? 'modo-claro' : ''}`}>
            <div className="tarjeta-registro">
                <button
                    className="alternador-tema"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDarkMode ? '☀️' : '🌙'}
                </button>

                <div className="icono-registro">
                    <img src={logo} alt="Nexora Logo" className="imagen-logotipo" />
                </div>

                <h1 className="titulo-registro">Crear Cuenta</h1>
                <p className="subtitulo-registro">Únete al marketplace</p>

                {error && <div className="error-registro">{error}</div>}

                <form onSubmit={handleSubmit} className="formulario-registro">
                    <div className="grupo-formulario">
                        <label htmlFor="name">
                            <span className="icono-etiqueta">👤</span> Nombre completo
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

                    <div className="grupo-formulario">
                        <label htmlFor="email">
                            <span className="icono-etiqueta">📧</span> Email
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

                    <div className="grupo-formulario">
                        <label htmlFor="password">
                            <span className="icono-etiqueta">🔐</span> Contraseña
                        </label>
                        <div className="contenedor-entrada-contrasena">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="boton-alternar-contrasena"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    <div className="grupo-formulario">
                        <label htmlFor="confirmPassword">
                            <span className="icono-etiqueta">🔐</span> Confirmar contraseña
                        </label>
                        <div className="contenedor-entrada-contrasena">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Repite tu contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="boton-alternar-contrasena"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    <div className="grupo-formulario">
                        <label htmlFor="role">
                            <span className="icono-etiqueta">👤</span> Tipo de cuenta
                        </label>
                        <select
                            id="role"
                            name="role"
                            className="seleccion-rol"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="cliente">Cliente (Comprador)</option>
                            <option value="vendedor">Vendedor (Comerciante)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className={`boton-registro ${loading ? 'cargando' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '⏳ Creando cuenta...' : '➕ Registrarse'}
                    </button>
                </form>

                <div className="pie-registro">
                    <span>¿Ya tienes cuenta? </span>
                    <button
                        type="button"
                        className="boton-enlace"
                        onClick={() => navigate('/login')}
                    >
                        Inicia sesión aquí
                    </button>
                </div>
            </div>
        </div>
    );
}
