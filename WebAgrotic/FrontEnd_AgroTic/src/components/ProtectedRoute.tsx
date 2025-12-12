import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@heroui/react';
import { usePermission } from '../contexts/PermissionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: { modulo: string; recurso: string; accion: string }[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermissions }) => {
  const { isAuthenticated, isInitializing, hasPermission } = usePermission();

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every(perm =>
      hasPermission(perm.modulo, perm.recurso, perm.accion)
    );
    if (!hasAllPermissions) {
      return <Navigate to="/login" replace />; 
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;