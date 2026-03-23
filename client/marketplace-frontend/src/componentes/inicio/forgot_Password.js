import React, { useState } from 'react';
import './forgot_Password.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            alert('Por favor, ingresa un email válido');
            setLoading(false);
            return;
        }

        // Simulación de envío de correo
        setTimeout(() => {
            console.log('Recuperar contraseña para:', email);
            alert(`Si el correo ${email} está registrado, recibirás instrucciones para restablecer tu contraseña.`);
            setMessage(`Si el correo ${email} está registrado, recibirás instrucciones para restablecer tu contraseña.`);
            setLoading(false);
            // The snippet does not navigate to login immediately after success message,
            // but the original code did. Keeping the original behavior for now,
            // but the snippet implies the message should be shown first.
            // For now, I'll keep the navigate after the message is set.
            // If the user wants to navigate after a delay, that's a separate instruction.
            // For now, the snippet doesn't show navigation after success, so I'll remove it from here.
            // The snippet has a button to navigate back to login.
            // navigate('/login'); // Removed this line as per snippet's implied flow
        }, 1500);
    };

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
