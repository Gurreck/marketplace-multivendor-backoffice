import React, { useState, useMemo } from 'react';
import './Registro.css';
import logo from '../../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    Sun, 
    Moon, 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    UserPlus, 
    Loader2,
    ShieldCheck,
    Check,
    X as XIcon
} from 'lucide-react';
import TerminosCondiciones from '../TerminosCondiciones/TerminosCondiciones';

export default function Registro() {
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
    const [aceptoTerminos, setAceptoTerminos] = useState(false);
    const [error, setError] = useState(''); // Mensajes de error
    const [loading, setLoading] = useState(false); // Estado de carga (submitting)
    const [isDarkMode, setIsDarkMode] = useState(true); // Tema local
    const [showPassword, setShowPassword] = useState(false); // Visibilidad contraseña
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Visibilidad confirmación

    // ===== VALIDACIÓN DE CONTRASEÑA =====
    const passwordRules = useMemo(() => {
        const pwd = formData.password;
        return [
            { label: 'Mínimo 8 caracteres', valid: pwd.length >= 8 },
            { label: 'Una letra mayúscula', valid: /[A-Z]/.test(pwd) },
            { label: 'Una letra minúscula', valid: /[a-z]/.test(pwd) },
            { label: 'Un número', valid: /[0-9]/.test(pwd) },
            { label: 'Un carácter especial (!@#$%^&*)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
        ];
    }, [formData.password]);

    const passwordStrength = useMemo(() => {
        const passedCount = passwordRules.filter(r => r.valid).length;
        if (passedCount <= 1) return { level: 'Muy débil', color: '#ef4444', width: '20%' };
        if (passedCount === 2) return { level: 'Débil', color: '#f59e0b', width: '40%' };
        if (passedCount === 3) return { level: 'Media', color: '#f59e0b', width: '60%' };
        if (passedCount === 4) return { level: 'Fuerte', color: '#10b981', width: '80%' };
        return { level: 'Muy fuerte', color: '#10b981', width: '100%' };
    }, [passwordRules]);

    const allPasswordValid = passwordRules.every(r => r.valid);

    // ===== MANEJADORES DE EVENTOS =====
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
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
            setError('Por favor, completa todos los campos'); setLoading(false); return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Por favor, ingresa un email válido'); setLoading(false); return;
        }
        if (!allPasswordValid) {
            setError('La contraseña no cumple todos los requisitos de seguridad'); setLoading(false); return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden'); setLoading(false); return;
        }
        if (!aceptoTerminos) {
            setError('Debes aceptar los Términos y Condiciones para registrarte'); setLoading(false); return;
        }

        try {
            await register(formData.name, formData.email, formData.password, formData.role);
            alert(`¡Cuenta creada exitosamente! Bienvenido ${formData.name}`);
            setError('');
            setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'cliente' });
            setAceptoTerminos(false);
            navigate('/login');
        } catch (err) {
            const errMsg = err.response?.data?.errores
                ? err.response.data.errores.join('. ')
                : err.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.';
            setError(errMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`contenedor-registro ${!isDarkMode ? 'modo-claro' : ''}`}>
            <div className="tarjeta-registro">
                <button
                    className="alternador-tema"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="icono-registro">
                    <img src={logo} alt="Nexora Logo" className="imagen-logotipo" />
                </div>

                <h1 className="titulo-registro">Crear Cuenta</h1>
                <p className="subtitulo-registro">Únete al marketplace</p>

                {error && (
                    <div className="error-registro">
                        <ShieldCheck size={18} style={{ marginRight: '8px' }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="formulario-registro">
                    <div className="grupo-formulario">
                        <label htmlFor="name">
                            <span className="icono-etiqueta"><User size={18} /></span> Nombre completo
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
                            <span className="icono-etiqueta"><Mail size={18} /></span> Email
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
                            <span className="icono-etiqueta"><Lock size={18} /></span> Contraseña
                        </label>
                        <div className="contenedor-entrada-contrasena">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Contraseña segura"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="boton-alternar-contrasena"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Indicador de fortaleza */}
                        {formData.password && (
                            <div className="password-strength-container">
                                <div className="password-strength-bar">
                                    <div
                                        className="password-strength-fill"
                                        style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                                    />
                                </div>
                                <span className="password-strength-text" style={{ color: passwordStrength.color }}>
                                    {passwordStrength.level}
                                </span>
                                <div className="password-rules-list">
                                    {passwordRules.map((rule, i) => (
                                        <div key={i} className={`password-rule ${rule.valid ? 'valid' : 'invalid'}`}>
                                            {rule.valid ? <Check size={14} /> : <XIcon size={14} />}
                                            <span>{rule.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grupo-formulario">
                        <label htmlFor="confirmPassword">
                            <span className="icono-etiqueta"><Lock size={18} /></span> Confirmar contraseña
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
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <span className="password-mismatch">Las contraseñas no coinciden</span>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                            <span className="password-match">Las contraseñas coinciden ✓</span>
                        )}
                    </div>

                    <div className="grupo-formulario">
                        <label htmlFor="role">
                            <span className="icono-etiqueta"><ShieldCheck size={18} /></span> Tipo de cuenta
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

                    {/* Términos y Condiciones */}
                    <TerminosCondiciones aceptado={aceptoTerminos} onChange={setAceptoTerminos} />

                    <button
                        type="submit"
                        className={`boton-registro ${loading ? 'cargando' : ''}`}
                        disabled={loading || !aceptoTerminos || !allPasswordValid}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animacion-giro" size={20} />
                                Creando cuenta...
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Registrarse
                            </>
                        )}
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
