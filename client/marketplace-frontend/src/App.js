import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardVendedor from "./pages/DashboardVendedor";
import DashboardAdmin from "./pages/DashboardAdmin";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import "./App.css";

// Componente que redirige al dashboard según el rol
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case "administrador":
      return <Navigate to="/admin/dashboard" replace />;
    case "vendedor":
      return <Navigate to="/vendedor/dashboard" replace />;
    case "cliente":
      return <Navigate to="/cliente/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Redirige a home si ya está autenticado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    switch (user?.role) {
      case "administrador":
        return <Navigate to="/admin/dashboard" replace />;
      case "vendedor":
        return <Navigate to="/vendedor/dashboard" replace />;
      case "cliente":
        return <Navigate to="/cliente/dashboard" replace />;
      default:
        break;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas - Cliente */}
          <Route
            path="/cliente/dashboard"
            element={
              <PrivateRoute roles={["cliente"]}>
                <DashboardCliente />
              </PrivateRoute>
            }
          />
          <Route
            path="/cliente/pedidos"
            element={
              <PrivateRoute roles={["cliente"]}>
                <DashboardCliente />
              </PrivateRoute>
            }
          />

          {/* Rutas protegidas - Vendedor */}
          <Route
            path="/vendedor/dashboard"
            element={
              <PrivateRoute roles={["vendedor"]}>
                <DashboardVendedor />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendedor/productos"
            element={
              <PrivateRoute roles={["vendedor"]}>
                <DashboardVendedor />
              </PrivateRoute>
            }
          />

          {/* Rutas protegidas - Administrador */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={["administrador"]}>
                <DashboardAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={["administrador"]}>
                <DashboardAdmin />
              </PrivateRoute>
            }
          />

          {/* Página de no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Redirigir home al dashboard correspondiente */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Ruta no encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
