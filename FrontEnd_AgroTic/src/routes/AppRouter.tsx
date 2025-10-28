import { Routes, Route, Navigate } from "react-router-dom";
import { MenuProvider } from "../contexts/MenuContext"; // ✅ IMPORTA EL CONTEXTO

// Páginas
import LoginPage from "../pages/LoginPage";
import GestionZonasPage from "../pages/GestionZonasPage";
import RecoverPasswordPage from "../pages/RecoverPasswordPage";
import RegisterPage from "../pages/RegisterPage";
import MainLayout from "../components/templates/MainLayout";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import UserProfilePage from "../pages/UserProfilePage";
import PanelControl from "../components/organisms/PanelControl";
import ProtectedRoute from "../components/ProtectedRoute";

import Dashboard from "../pages/Dashboard";
import CultivosPage from "../pages/CultivosPage";
import ActividadesPage from "../pages/ActividadesPage";
import ZapatoPage from "../pages/ZapatoPage";
import InventoryPage from "../pages/InventoryPage";
import MovementsPage from "../pages/MovementsPage";

const AppRouter = () => {
  return (
    <MenuProvider>
      <Routes>
        {/* Redirigir la raíz al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Página de inicio de sesión */}
        <Route path="/login" element={<LoginPage />} />
        {/* Página de registro de usuario */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Página de recuperación de contraseña */}
        <Route path="/recover-password" element={<RecoverPasswordPage />} />
        {/* Página de perfil de usuario */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        {/* Aplicación principal protegida */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="panel-control" element={<PanelControl />} />
          <Route path="cultivos" element={<CultivosPage />} />
          <Route path="actividades" element={<ActividadesPage />} />
          <Route path="iot" element={<GestionZonasPage />} />
          <Route path="zapato" element={<ZapatoPage />} />
          <Route path="inventario" element={<InventoryPage />} />
          <Route path="movements" element={<MovementsPage />} />
        </Route>

        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </MenuProvider>
  );
};

export default AppRouter;
