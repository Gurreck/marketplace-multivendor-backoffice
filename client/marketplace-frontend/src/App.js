import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardVendedor from "./pages/DashboardVendedor";
import DashboardAdmin from "./pages/DashboardAdmin";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import SalesPage from "./pages/SalesPage";
import "./App.css";

// Redirige a home si ya está autenticado (para login/register)
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
      <CartProvider>
        <Router>
          <Routes>
            {/* Rutas públicas del Marketplace */}
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />

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

            {/* Rutas protegidas - Vendedor */}
            <Route
              path="/vendedor/dashboard"
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

            {/* Rutas Comunes Protegidas */}
            <Route
              path="/profile"
              element={
                <PrivateRoute roles={["cliente", "vendedor", "administrador"]}>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute roles={["cliente", "vendedor", "administrador"]}>
                  <MyOrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <PrivateRoute roles={["vendedor", "administrador"]}>
                  <SalesPage />
                </PrivateRoute>
              }
            />

            {/* Página de no autorizado */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Ruta no encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
