import React, { useState } from 'react';
import './forgot_Password.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import {
    Sun,
    Moon,
    Mail,
    CheckCircle,
    AlertTriangle,
    Loader2,
    ArrowLeft
} from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');



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
        setError('');
        setMessage('');

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
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="icono-olvido">
                    <img src={logo} alt="Nexora Logo" className="imagen-logotipo" />
                </div>

                <h2 className="titulo-olvido">¿Olvidaste tu contraseña?</h2>
                <p className="subtitulo-olvido">Ingresa tu email para recibir un enlace de recuperación</p>

                {error && (
                    <div className="error-olvido">
                        <AlertTriangle size={18} /> {error}
                    </div>
                )}

                {message && (
                    <div className="mensaje-exito-olvido">
                        <CheckCircle size={18} /> {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="formulario-olvido">
                    <div className="grupo-formulario">
                        <label htmlFor="email">
                            <span className="icono-etiqueta"><Mail size={18} /></span> Email de recuperación
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
                        {loading ? (
                            <>
                                <Loader2 className="animacion-giro" size={20} />
                                Procesando...
                            </>
                        ) : 'Enviar instrucciones'}
                    </button>
                </form>

                <div className="pie-olvido">
                    <button
                        type="button"
                        className="boton-enlace"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        <ArrowLeft size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
