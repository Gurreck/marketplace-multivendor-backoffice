import React, { useState } from 'react';
import './forgot_Password.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const navigate = useNavigate();

    // ===== ESTADO =====
    const [email, setEmail] = useState(''); // Correo para recuperación
    const [loading, setLoading] = useState(false); // Estado de carga de la petición
    const [isDarkMode, setIsDarkMode] = useState(true); // Tema local de la página
    const [message, setMessage] = useState(''); // Mensaje de éxito
    const [error, setError] = useState(''); // Mensaje de error

    // ===== UTILIDADES =====
    /**
     * Alterna el tema entre claro y oscuro
     */
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // ===== MANEJADORES DE EVENTOS =====
    /**
     * Procesa la solicitud de recuperación de contraseña
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        // Validación básica de email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Por favor, ingresa un email válido');
            setLoading(false);
            return;
        }

        // Simulación de envío de correo (integrar con API en el futuro)
        setTimeout(() => {
            console.log('Recuperar contraseña para:', email);
            setMessage(`Si el correo ${email} está registrado, recibirás instrucciones para restablecer tu contraseña.`);
            setLoading(false);
        }, 1500);
    };

    // ===== RENDERIZADO =====
    return (
        <div className={`contenedor-olvido ${!isDarkMode ? 'modo-claro' : ''}`}>
            <div className="tarjeta-olvido">
                <button
                    className="alternador-tema"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDarkMode ? '☀️' : '🌙'}
                </button>

                <div className="icono-olvido">
                    <img src={logo} alt="Nexora Logo" className="imagen-logotipo" />
                </div>

                <h2 className="titulo-olvido">¿Olvidaste tu contraseña?</h2>
                <p className="subtitulo-olvido">Ingresa tu email para recibir un enlace de recuperación</p>

                {error && (
                    <div className="error-olvido">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {message && (
                    <div className="mensaje-exito-olvido">
                        <span>✅</span> {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="formulario-olvido">
                    <div className="grupo-formulario">
                        <label htmlFor="email">
                            <span className="icono-etiqueta">📧</span> Email de recuperación
                        </label>
                        <div className="contenedor-entrada-icono">
                            <input
                                type="email"
                                id="email"
                                placeholder="tú@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`boton-olvido ${loading ? 'cargando' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '⏳ Procesando...' : 'Aceptar'}
                    </button>
                </form>

                <div className="pie-olvido">
                    <button
                        type="button"
                        className="boton-enlace"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
