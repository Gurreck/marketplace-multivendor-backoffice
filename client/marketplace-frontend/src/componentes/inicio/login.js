import React, { useState } from 'react';
import './login.css';
import logo from '../../resource/logo1.png';

export default function Login({ onLoginSuccess, onRegisterClick, onForgotClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, ingresa un email válido');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Aquí irá la llamada a tu API de autenticación
      // Ejemplo:
      // const response = await fetch('http://localhost:5000/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();

      console.log('Intentar login con:', { email, password });

      // Login exitoso - navega a la vista principal
      onLoginSuccess(email);
      setEmail('');
      setPassword('');

    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${!isDarkMode ? 'light-mode' : ''}`}>
      <div className="login-card">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <div className="login-icon">
          <img src={logo} alt="Nexora Logo" className="logo-img" />
        </div>

        <h1 className="login-title">Nexora</h1>
        <p className="login-subtitle">Inicia sesión en tu cuenta</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span> Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="tú@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="forgot-link-btn"
              onClick={onForgotClick}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? '⏳ Iniciando sesión...' : '➕ Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <span>¿No tienes cuenta? </span>
          <button
            type="button"
            className="link-button"
            onClick={onRegisterClick}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}
