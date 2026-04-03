import React, { useState } from 'react';
import './IniciarSesion.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sun, 
  Moon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  UserPlus, 
  Loader2 
} from 'lucide-react';

export default function IniciarSesion({ onRegisterClick, onForgotClick }) {
  // ===== ESTADO =====
  const [email, setEmail] = useState(''); // Correo ingresado
  const [password, setPassword] = useState(''); // Contraseña ingresada
  const [error, setError] = useState(''); // Mensajes de error de login
  const [loading, setLoading] = useState(false); // Estado de carga (durante la petición)
  const [isDarkMode, setIsDarkMode] = useState(true); // Tema local de la página
  const [showPassword, setShowPassword] = useState(false); // Visibilidad de la contraseña

  const { login } = useAuth();
  const navigate = useNavigate();

  // ===== UTILIDADES Y NAVEGACIÓN =====
  /**
   * Alterna el tema entre claro y oscuro
   */
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  /**
   * Determina la ruta de redirección según el rol del usuario
   * @param {string} rol - El rol del usuario (administrador, vendedor, cliente)
   * @returns {string} La ruta de destino
   */
  const redirigirPorRol = (rol) => {
    switch (rol) {
      case 'administrador':
        return '/admin/dashboard';
      case 'vendedor':
        return '/vendedor';        
      case 'cliente':
        return '/cliente';
      default:
        return '/';
    }
  };

  // ===== MANEJADORES DE EVENTOS =====
  /**
   * Procesa el inicio de sesión enviando las credenciales al servicio de autenticación
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      navigate(redirigirPorRol(userData.role));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Error al iniciar sesión. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDERIZADO =====
  return (
    <div className={`contenedor-inicio-sesion ${!isDarkMode ? 'modo-claro' : ''}`}>
      <div className="tarjeta-inicio-sesion">
        <button 
          className="alternador-tema" 
          onClick={toggleTheme}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="icono-inicio-sesion">
          <img src={logo} alt="Nexora Logo" className="imagen-logotipo" />
        </div>

        <h2 className="titulo-inicio-sesion">Bienvenido a Nexora</h2>
        <p className="subtitulo-inicio-sesion">Tu marketplace premium</p>

        {error && (
          <div className="error-inicio-sesion">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="formulario-inicio-sesion">
          <div className="grupo-formulario">
            <label>Correo Electrónico</label>
            <div className="contenedor-entrada-icono">
              <span className="icono-etiqueta"><Mail size={18} /></span>
              <input
                type="email"
                id="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="grupo-formulario">
            <label>Contraseña</label>
            <div className="contenedor-entrada-icono">
              <span className="icono-etiqueta"><Lock size={18} /></span>
              <div className="contenedor-entrada-contrasena">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="boton-alternar-contrasena"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button
                type="button"
                className="boton-enlace-olvido"
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`boton-inicio-sesion ${loading ? 'cargando' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animacion-giro" size={20} />
                Iniciando sesión...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="pie-inicio-sesion">
          <span>¿No tienes cuenta? </span>
          <button
            type="button"
            className="boton-enlace"
            onClick={() => navigate('/register')}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}