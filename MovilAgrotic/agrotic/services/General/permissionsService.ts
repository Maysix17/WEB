// Servicio de permisos basado en el sistema de permisos granular
// Utiliza el contexto de permisos para verificaciones basadas en módulo, recurso y acción

import type { Permission } from '../../types/Modulo Usuarios/auth';

// Utilidades para verificar permisos específicos
// Nota: Estas funciones deben usarse dentro de componentes que tengan acceso al contexto usePermission
export const permissionsService = {
  // Verificaciones específicas para módulos comunes
  canViewDashboard: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Inicio', 'dashboard', 'ver');
  },

  canManageZones: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Zonas', 'gestion', 'ver');
  },

  canViewIoT: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('IOT', 'sensores', 'ver');
  },

  canManageCrops: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Cultivos', 'gestion', 'ver');
  },

  canCreateCrops: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Cultivos', 'inventario', 'crear');
  },

  canEditCrops: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Cultivos', 'inventario', 'editar');
  },

  canDeleteCrops: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Cultivos', 'inventario', 'eliminar');
  },

  canManageActivities: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Actividades', 'gestion', 'ver');
  },

  canCreateActivities: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Actividades', 'calendario', 'crear');
  },

  canManageInventory: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Inventario', 'gestion', 'ver');
  },

  canManageUsers: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Usuarios', 'panel de control', 'ver');
  },

  canCreateUsers: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Usuarios', 'gestion', 'crear');
  },

  canEditUsers: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Usuarios', 'gestion', 'editar');
  },

  canDeleteUsers: (hasPermission: (modulo: string, recurso: string, accion: string) => boolean): boolean => {
    return hasPermission('Usuarios', 'gestion', 'eliminar');
  },

  // Función genérica para verificar múltiples permisos
  hasAnyPermission: (
    hasPermission: (modulo: string, recurso: string, accion: string) => boolean,
    permissions: Permission[]
  ): boolean => {
    return permissions.some(perm => hasPermission(perm.modulo, perm.recurso, perm.accion));
  },

  // Función genérica para verificar todos los permisos requeridos
  hasAllPermissions: (
    hasPermission: (modulo: string, recurso: string, accion: string) => boolean,
    permissions: Permission[]
  ): boolean => {
    return permissions.every(perm => hasPermission(perm.modulo, perm.recurso, perm.accion));
  },
};