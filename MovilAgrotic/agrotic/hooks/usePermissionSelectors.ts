import { useMemo } from 'react';
import { usePermission } from '../contexts/PermissionContext';

/**
 * Selector personalizado para obtener solo el estado de autenticación
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = usePermission();
  return isAuthenticated;
}

/**
 * Selector personalizado para obtener solo los permisos
 */
export function usePermissions() {
  const { permissions } = usePermission();
  return permissions;
}

/**
 * Selector personalizado para obtener solo el usuario
 */
export function useUser() {
  const { user } = usePermission();
  return user;
}

/**
 * Selector personalizado para verificar un permiso específico
 */
export function useHasPermission(modulo: string, recurso: string, accion: string) {
  const { hasPermission } = usePermission();

  return useMemo(() => {
    return hasPermission(modulo, recurso, accion);
  }, [hasPermission, modulo, recurso, accion]);
}

/**
 * Selector personalizado para obtener permisos de un módulo específico
 */
export function useModulePermissions(modulo: string) {
  const { permissions } = usePermission();

  return useMemo(() => {
    return permissions.filter(p => p.modulo === modulo);
  }, [permissions, modulo]);
}

/**
 * Selector personalizado para verificar si el usuario está inicializando
 */
export function useIsInitializing() {
  const { isInitializing } = usePermission();
  return isInitializing;
}

/**
 * Selector personalizado para verificar si está refrescando
 */
export function useIsRefreshing() {
  const { isRefreshing } = usePermission();
  return isRefreshing;
}

/**
 * Selector compuesto para obtener estado de autenticación y permisos básicos
 */
export function useAuthState() {
  const { isAuthenticated, permissions, user } = usePermission();

  return useMemo(() => ({
    isAuthenticated,
    permissions,
    user,
    hasAnyPermissions: permissions.length > 0,
  }), [isAuthenticated, permissions, user]);
}