/**
 * CONTEXT DE PERMISOS - GESTIÓN DE AUTENTICACIÓN Y AUTORIZACIÓN
 *
 * Este contexto maneja todo el sistema de permisos de la aplicación:
 * - Autenticación de usuarios con JWT
 * - Gestión de permisos basados en roles
 * - Refresh automático de tokens
 * - Estado global de autenticación
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, loginUser, refreshToken, isTokenExpiringSoon } from '../services/authService';
import type { Permission, LoginPayload } from '../types/Auth';
import type { User } from '../types/user';
import { setupAxiosInterceptors } from '../lib/axios/axios';
import { getProfile } from '../services/profileService';
import Cookies from 'js-cookie';

/**
 * Interfaz del contexto de permisos
 * Define todos los métodos y estados disponibles para la gestión de autenticación
 */
interface PermissionContextType {
  user: User | null;                    // Usuario autenticado actual
  permissions: Permission[];            // Lista de permisos del usuario
  lastUpdate: number;                   // Timestamp de última actualización
  isAuthenticated: boolean;             // Estado de autenticación
  isRefreshing: boolean;                // Estado de refresh de token
  isInitializing: boolean;              // Estado de inicialización
  hasPermission: (modulo: string, recurso: string, accion: string) => boolean; // Verificar permisos
  login: (payload: LoginPayload) => Promise<void>;     // Iniciar sesión
  logout: () => Promise<void>;           // Cerrar sesión
  refresh: () => Promise<void>;          // Refrescar tokens
  setUser: (user: User | null) => void;  // Establecer usuario
  setPermissions: (permissions: Permission[]) => void; // Establecer permisos
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  // ESTADO GLOBAL DEL CONTEXTO
  const [user, setUser] = useState<User | null>(null);           // Usuario actualmente autenticado
  const [permissions, setPermissions] = useState<Permission[]>([]); // Lista de permisos del usuario
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now()); // Última actualización de permisos
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // ¿Usuario autenticado?
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // ¿Refrescando token?
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // ¿Inicializando app?

  // REFERENCIAS PARA CONTROLAR INICIALIZACIÓN Y TIMERS
  const initRef = useRef<boolean>(false);              // Evita inicializaciones múltiples
  const refreshTimerRef = useRef<number | null>(null); // Timer para refresh proactivo
  const lastRefreshAttemptRef = useRef<number>(0);     // Último intento de refresh

  /**
   * GESTIÓN DE COOKIES PARA PERMISOS
   * Los permisos se almacenan en cookies para acceso rápido desde JavaScript
   * (diferente de los tokens JWT que están en cookies HTTP-only)
   */

  /**
   * Guarda los permisos del usuario en cookies para persistencia
   * @param permissions - Array de permisos a guardar
   */
  const savePermissionsToCookie = (permissions: Permission[]) => {
    Cookies.set('user_permissions', JSON.stringify(permissions), {
      expires: 7, // Expira en 7 días
      secure: import.meta.env.PROD,    // Solo HTTPS en producción
      sameSite: 'strict'               // Protección CSRF
    });
  };

  /**
   * Elimina las cookies de permisos del cliente
   */
  const clearClientCookies = () => {
    Cookies.remove('user_permissions');
  };

  /**
   * Verifica si existe una sesión válida comprobando las cookies
   * @returns true si hay indicadores de autenticación válidos
   */
  const hasValidSession = (): boolean => {
    // Verifica si existen cookies de permisos (indicador de sesión válida)
    const hasPermissions = Cookies.get('user_permissions') !== undefined;
    // Aquí se podrían agregar más verificaciones de autenticación
    return hasPermissions;
  };

  /**
   * Limpia completamente el estado de autenticación
   * Se llama cuando el usuario cierra sesión o la sesión expira
   */
  const clearAuthState = () => {
    console.log('PermissionContext: Limpiando estado de autenticación');
    setUser(null);                    // Eliminar usuario
    updatePermissions([]);           // Limpiar permisos
    clearClientCookies();            // Eliminar cookies de permisos
    setIsAuthenticated(false);       // Marcar como no autenticado
    setIsRefreshing(false);          // Detener estado de refresh
    setIsInitializing(false);        // Finalizar inicialización

    // Limpiar timer de refresh proactivo
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  /**
   * Actualiza la lista de permisos del usuario
   * @param newPermissions - Nuevos permisos a establecer
   */
  const updatePermissions = (newPermissions: Permission[]) => {
    setPermissions(newPermissions);
    setLastUpdate(Date.now()); // Actualizar timestamp para forzar re-renders
  };

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param modulo - Nombre del módulo (ej: "Cultivos", "Actividades")
   * @param recurso - Nombre del recurso (ej: "cultivos", "acceso_cultivos")
   * @param accion - Acción permitida (ej: "ver", "crear", "editar")
   * @returns true si el usuario tiene el permiso
   */
  const hasPermission = (modulo: string, recurso: string, accion: string): boolean => {
    const result = permissions.some(p =>
      p.modulo === modulo &&
      p.recurso === recurso &&
      p.accion === accion
    );
    console.log(`Verificación de permiso: modulo=${modulo}, recurso=${recurso}, accion=${accion} => ${result}`);
    console.log('Todos los permisos:', permissions);
    return result;
  };

  /**
   * Procesa el inicio de sesión del usuario
   * 1. Envía credenciales al backend
   * 2. Obtiene perfil del usuario con permisos
   * 3. Mapea permisos a formato simplificado
   * 4. Guarda permisos en cookies
   * 5. Inicia refresh proactivo de tokens
   * @param payload - Credenciales de login (dni, password)
   */
  const login = async (payload: LoginPayload): Promise<void> => {
    try {
      // 1. Enviar credenciales al backend (setea cookies HTTP-only)
      await loginUser(payload);

      // 2. Obtener perfil completo del usuario con permisos
      const profile = await getProfile();
      setUser(profile);

      // 3. Mapear permisos del backend a formato simplificado
      const mappedPermissions = (profile.rol.permisos as any[]).map(p => ({
        modulo: p.recurso.modulo.nombre,    // ej: "Cultivos"
        recurso: p.recurso.nombre,          // ej: "cultivos"
        accion: p.accion,                   // ej: "ver", "crear"
      }));

      // 4. Actualizar estado de permisos y guardar en cookies
      updatePermissions(mappedPermissions);
      savePermissionsToCookie(mappedPermissions);

      console.log('Inicio de sesión exitoso:', profile);
      setIsAuthenticated(true);

      // 5. Iniciar sistema de refresh proactivo de tokens
      scheduleProactiveRefresh();
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      throw error;
    }
  };

  /**
   * Refresca los tokens JWT y actualiza el estado de autenticación
   * Se llama automáticamente cuando expira el access token o proactivamente
   */
  const refresh = useCallback(async (): Promise<void> => {
    console.log('PermissionContext: Iniciando refresh de tokens');
    setIsRefreshing(true);
    try {
      // 1. Refrescar tokens con el backend
      await refreshToken();
      console.log('PermissionContext: Refresh de token exitoso');

      // 2. Obtener perfil actualizado (por si cambiaron permisos)
      const profile = await getProfile();
      console.log('PermissionContext: Perfil obtenido exitosamente', profile);
      setUser(profile);

      // 3. Mapear permisos actualizados
      const mappedPermissions = (profile.rol.permisos as any[]).map(p => ({
        modulo: p.recurso.modulo.nombre,
        recurso: p.recurso.nombre,
        accion: p.accion,
      }));

      // 4. Actualizar estado y cookies
      updatePermissions(mappedPermissions);
      savePermissionsToCookie(mappedPermissions);
      setIsAuthenticated(true);

      // 5. Reiniciar sistema de refresh proactivo
      scheduleProactiveRefresh();
    } catch (error) {
      console.error('PermissionContext: Error en refresh:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * SISTEMA DE REFRESH PROACTIVO
   * Verifica periódicamente si el token está por expirar y lo refresca automáticamente
   * Evita interrupciones en la experiencia del usuario
   */
  const scheduleProactiveRefresh = useCallback(() => {
    // Evitar refreshes demasiado frecuentes (mínimo 30 segundos entre intentos)
    const now = Date.now();
    if (now - lastRefreshAttemptRef.current < 30000) {
      console.log('PermissionContext: Saltando refresh proactivo, muy pronto desde último intento');
      return;
    }
    lastRefreshAttemptRef.current = now;

    // Limpiar timer existente
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Verificar si el token expira pronto (dentro de 5 minutos)
    if (isTokenExpiringSoon(5)) {
      console.log('PermissionContext: Token expirando pronto, refrescando proactivamente');
      // Refrescar inmediatamente si está por expirar
      refresh().catch(error => {
        console.error('PermissionContext: Error en refresh proactivo:', error);
      });
    } else {
      // Programar próxima verificación en 1 minuto
      const nextCheckTime = 60 * 1000; // 1 minuto
      refreshTimerRef.current = window.setTimeout(() => {
        scheduleProactiveRefresh();
      }, nextCheckTime);
    }
  }, [refresh]);

  /**
   * Procesa el cierre de sesión del usuario
   * 1. Llama al backend para invalidar sesión
   * 2. Limpia estado local de autenticación
   * 3. Redirige a página de login
   */
  const logout = async (): Promise<void> => {
    try {
      // 1. Invalidar sesión en backend (borra cookies HTTP-only)
      await logoutUser();
      // 2. Limpiar estado local
      clearAuthState();
      // 3. Redirigir a login
      navigate('/login');
    } catch (error) {
      console.error('Error en cierre de sesión:', error);
      // Incluso con error, limpiar datos del cliente
      clearAuthState();
      navigate('/login');
    }
  };

  /**
   * EFECTO DE INICIALIZACIÓN DE LA APLICACIÓN
   * Se ejecuta una sola vez al montar el componente
   * Verifica sesión existente y configura interceptores de Axios
   */
  useEffect(() => {
    // Prevenir inicializaciones múltiples
    if (initRef.current) {
      console.log('PermissionContext: Saltando inicialización duplicada');
      return;
    }
    initRef.current = true;

    const init = async () => {
      console.log('PermissionContext: Iniciando inicialización de la aplicación');
      setIsInitializing(true);
      console.log('PermissionContext: Verificando sesión existente...');

      // Verificar si hay una sesión válida
      const hasSession = hasValidSession();

      console.log('PermissionContext: Todas las cookies:', document.cookie);
      console.log('PermissionContext: Sesión válida presente:', hasSession);

      if (!hasSession) {
        console.log('PermissionContext: No se encontró sesión válida, usuario no autenticado');
        clearAuthState();
        setupAxiosInterceptors(refresh, navigate, logout);
        return;
      }

      try {
        console.log('PermissionContext: Sesión encontrada, intentando obtener perfil...');
        const profile = await getProfile();
        console.log('PermissionContext: Perfil cargado exitosamente', profile);
        setUser(profile);

        // Mapear permisos del perfil
        const mappedPermissions = (profile.rol.permisos as any[]).map(p => ({
          modulo: p.recurso.modulo.nombre,
          recurso: p.recurso.nombre,
          accion: p.accion,
        }));

        updatePermissions(mappedPermissions);
        savePermissionsToCookie(mappedPermissions);
        setIsAuthenticated(true);
        console.log('PermissionContext: Usuario autenticado exitosamente');

        // Iniciar refresh proactivo para sesión existente
        scheduleProactiveRefresh();
      } catch (error: any) {
        console.log('PermissionContext: Error al obtener perfil:', error);

        // Si es error 401, los tokens son inválidos/expirados
        if (error.response?.status === 401) {
          console.log('PermissionContext: Error 401, sesión inválida');
          clearAuthState();
          navigate('/login');
          return;
        }

        // Para otros errores, intentar refresh como fallback
        try {
          console.log('PermissionContext: Intentando refresh de token...');
          await refreshToken();
          console.log('PermissionContext: Refresh exitoso, reintentando perfil...');

          const profile = await getProfile();
          console.log('PermissionContext: Perfil cargado después de refresh', profile);
          setUser(profile);

          const mappedPermissions = (profile.rol.permisos as any[]).map(p => ({
            modulo: p.recurso.modulo.nombre,
            recurso: p.recurso.nombre,
            accion: p.accion,
          }));

          updatePermissions(mappedPermissions);
          savePermissionsToCookie(mappedPermissions);
          setIsAuthenticated(true);
          console.log('PermissionContext: Usuario autenticado después de refresh');

          // Iniciar refresh proactivo después de recuperación exitosa
          scheduleProactiveRefresh();
        } catch (refreshError: any) {
          console.log('PermissionContext: Refresh falló:', refreshError);

          // Si refresh también falla con 401, limpiar sesión
          if (refreshError.response?.status === 401) {
            console.log('PermissionContext: Refresh falló con 401, limpiando sesión');
            clearAuthState();
            navigate('/login');
          } else {
            console.log('PermissionContext: Error inesperado en refresh, tratando como sin sesión');
            clearAuthState();
          }
        }
      }

      // Configurar interceptores de Axios para manejo automático de tokens
      setupAxiosInterceptors(refresh, navigate, logout);
      setIsInitializing(false);
    };
    init();
  }, []); // Array de dependencias vacío para ejecutar solo una vez

  // OBJETO DE VALOR PARA EL CONTEXTO
  // Contiene todos los estados y funciones disponibles para los componentes hijos
  const value: PermissionContextType = {
    user,                    // Usuario autenticado
    permissions,            // Lista de permisos
    lastUpdate,            // Última actualización
    isAuthenticated,       // Estado de autenticación
    isRefreshing,          // Estado de refresh
    isInitializing,        // Estado de inicialización
    hasPermission,         // Función para verificar permisos
    login,                 // Función de login
    logout,                // Función de logout
    refresh,               // Función de refresh
    setUser,               // Función para establecer usuario
    setPermissions: updatePermissions, // Función para establecer permisos
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de permisos
 * Proporciona acceso a todas las funciones de autenticación y permisos
 *
 * Uso típico:
 * ```typescript
 * const { user, permissions, hasPermission, login, logout } = usePermission();
 *
 * // Verificar permiso
 * if (hasPermission("Cultivos", "cultivos", "crear")) {
 *   // Mostrar botón de crear
 * }
 *
 * // Login
 * await login({ dni: "123456789", password: "mypass" });
 * ```
 *
 * @returns PermissionContextType - Objeto con estados y funciones de permisos
 * @throws Error si se usa fuera de un PermissionProvider
 */
export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission debe usarse dentro de un PermissionProvider');
  }
  return context;
};