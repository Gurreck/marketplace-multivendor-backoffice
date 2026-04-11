import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import IniciarSesion from '../componentes/Acceso/IniciarSesion';
import { AuthProvider } from '../context/AuthContext';

jest.mock('lucide-react', () => ({
  Sun: () => null,
  Moon: () => null,
  Mail: () => null,
  Lock: () => null,
  Eye: () => null,
  EyeOff: () => null,
  AlertTriangle: () => null,
  UserPlus: () => null,
  Loader2: () => null,
}));

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    user: null,
    isAuthenticated: false,
  }),
}));

describe('Iniciar Sesión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el formulario de login', () => {
    render(<AuthProvider><IniciarSesion /></AuthProvider>);
    expect(screen.getByText(/Bienvenido a Nexora/i)).toBeInTheDocument();
  });

  it('tiene botón de iniciar sesión', () => {
    render(<AuthProvider><IniciarSesion /></AuthProvider>);
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renderiza campo de email', () => {
    render(<AuthProvider><IniciarSesion /></AuthProvider>);
    expect(screen.getByPlaceholderText(/ejemplo@correo.com/i)).toBeInTheDocument();
  });

  it('renderiza campo de contraseña', () => {
    render(<AuthProvider><IniciarSesion /></AuthProvider>);
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });
});