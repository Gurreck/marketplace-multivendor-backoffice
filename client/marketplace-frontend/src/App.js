import React, { useState } from 'react';
import './App.css';
import Login from './Inicio/login';
import Register from './Inicio/register';

function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="App">
      {showRegister ? (
        <Register onBackToLogin={() => setShowRegister(false)} />
      ) : (
        <Login onRegisterClick={() => setShowRegister(true)} />
      )}
    </div>
  );
}

export default App;