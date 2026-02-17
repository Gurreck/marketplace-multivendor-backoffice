import React, { useState } from 'react';
import './App.css';
import Login from './Inicio/login';
import Register from './Inicio/register';
import ForgotPassword from './Inicio/forgot_Password';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot-password'

  return (
    <div className="App">
      {currentView === 'register' ? (
        <Register onBackToLogin={() => setCurrentView('login')} />
      ) : currentView === 'forgot-password' ? (
        <ForgotPassword onBackToLogin={() => setCurrentView('login')} />
      ) : (
        <Login
          onRegisterClick={() => setCurrentView('register')}
          onForgotClick={() => setCurrentView('forgot-password')}
        />
      )}
    </div>
  );
}

export default App;