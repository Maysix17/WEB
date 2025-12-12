import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { usePermission } from '../contexts/PermissionContext';
import type { Permission } from '../types/Modulo Usuarios/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions,
  fallback
}) => {
  const { isAuthenticated, isInitializing, hasPermission } = usePermission();

  // Show loading while initializing
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#374151" />
        <Text style={styles.loadingText}>Cargando permisos...</Text>
      </View>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return fallback || (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Debes iniciar sesión para acceder a esta sección</Text>
      </View>
    );
  }

  // Check specific permissions if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(perm =>
      hasPermission(perm.modulo, perm.recurso, perm.accion)
    );

    if (!hasAllPermissions) {
      return fallback || (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No tienes permisos para acceder a esta sección</Text>
        </View>
      );
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ProtectedRoute;