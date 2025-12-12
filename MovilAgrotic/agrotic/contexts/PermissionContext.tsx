import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser, loginUser, refreshToken } from '../services/Modulo Usuarios/authService';
import { getProfile } from '../services/Modulo Usuarios/profileService';
import { setupAxiosIntercepts, clearAxiosIntercepts } from '../services/General/axios/axios';
import { router } from 'expo-router';
import type { Permission, LoginPayload } from '../types/Modulo Usuarios/auth';

interface User {
  id: string;
  name: string;
  email: string;
  rol?: string;
  // Add other user properties as needed
}

interface PermissionContextType {
  user: User | null;
  permissions: Permission[];
  lastUpdate: number;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  isInitializing: boolean;
  hasPermission: (modulo: string, recurso: string, accion: string) => boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  setPermissions: (permissions: Permission[], isInitialLogin?: boolean) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false); // Start as false to not block the app
  const [showPermissionChangedAlert, setShowPermissionChangedAlert] = useState<boolean>(false);
  const initRef = useRef<boolean>(false);
  const permissionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoginRef = useRef<boolean>(true);

  const updatePermissions = useCallback(async (newPermissions: Permission[], isInitialLogin: boolean = false) => {
    try {
      // Get stored permissions from AsyncStorage
      const storedPermissionsStr = await AsyncStorage.getItem('user_permissions_snapshot');
      let storedPermissions: Permission[] = [];

      if (storedPermissionsStr) {
        storedPermissions = JSON.parse(storedPermissionsStr);
      }

      // Helper function to check if user is admin
      const isAdmin = user?.rol?.toLowerCase() === 'admin';
      
      console.log('PermissionContext: updatePermissions - User role:', user?.rol, 'Is Admin:', isAdmin);

      // Only show alert if we have stored permissions, they're different from new ones,
      // user is not admin, it's not initial login, and alert is not already showing
      if (storedPermissions.length > 0 &&
          !showPermissionChangedAlert &&
          !isAdmin &&
          !isInitialLogin &&
          !isInitialLoginRef.current) {
        const permissionsChanged = !arraysEqual(newPermissions, storedPermissions);
        console.log('PermissionContext: Permissions changed:', permissionsChanged, 'Should show alert:', !isAdmin);
        if (permissionsChanged) {
          setShowPermissionChangedAlert(true);
        }
      }

      // Update the initial login flag
      if (isInitialLogin) {
        isInitialLoginRef.current = false;
      }

      // Always update stored permissions for next comparison
      await AsyncStorage.setItem('user_permissions_snapshot', JSON.stringify(newPermissions));

    } catch (error) {
      console.error('Error updating permissions:', error);
    }

    setPermissions(newPermissions);
    setLastUpdate(Date.now());
  }, [showPermissionChangedAlert, user]);

  // Helper function to compare permission arrays
  const arraysEqual = (a: Permission[], b: Permission[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every(permA => b.some(permB =>
      permA.modulo === permB.modulo &&
      permA.recurso === permB.recurso &&
      permA.accion === permB.accion
    ));
  };

  const hasPermission = (modulo: string, recurso: string, accion: string): boolean => {
    return permissions.some(p => p.modulo === modulo && p.recurso === recurso && p.accion === accion);
  };

  const login = async (payload: LoginPayload): Promise<void> => {
    try {
      await loginUser(payload);
      const profile = await getProfile();
      setUser({
        id: profile.id,
        name: `${profile.nombres} ${profile.apellidos}`,
        email: profile.correo,
        rol: profile.rol?.nombre
      });
      const mappedPermissions = (profile.rol?.permisos as any[])?.map(p => ({
        modulo: p.recurso.modulo.nombre,
        recurso: p.recurso.nombre,
        accion: p.accion,
      })) || [];
      updatePermissions(mappedPermissions, true); // Mark as initial login
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const refresh = useCallback(async (): Promise<void> => {
    console.log('PermissionContext: Starting refresh');
    setIsRefreshing(true);
    try {
      await refreshToken();
      console.log('PermissionContext: refreshToken successful');
      const profile = await getProfile();
      console.log('PermissionContext: getProfile successful', profile);
      setUser({
        id: profile.id,
        name: `${profile.nombres} ${profile.apellidos}`,
        email: profile.correo,
        rol: profile.rol?.nombre
      });
      const mappedPermissions = (profile.rol?.permisos as any[])?.map(p => ({
        modulo: p.recurso.modulo.nombre,
        recurso: p.recurso.nombre,
        accion: p.accion,
      })) || [];
      updatePermissions(mappedPermissions, true); // Mark as initial login/refresh
      setIsAuthenticated(true);
    } catch (error) {
      console.error('PermissionContext: Refresh failed:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Clear permission checking interval FIRST
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current);
        permissionCheckIntervalRef.current = null;
      }

      // Clear axios intercepts to prevent further API calls
      clearAxiosIntercepts();

      // Clear all stored data
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_permissions_snapshot']);

      await logoutUser();
      setUser(null);
      setPermissions([]);
      setLastUpdate(Date.now());
      setIsAuthenticated(false);
      setShowPermissionChangedAlert(false);
      isInitialLoginRef.current = true; // Reset initial login flag
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear permission checking interval on error too
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current);
        permissionCheckIntervalRef.current = null;
      }
      // Clear axios intercepts on error too
      clearAxiosIntercepts();
      // Clear all stored data even on error
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_permissions_snapshot']);
      setUser(null);
      setPermissions([]);
      setLastUpdate(Date.now());
      setIsAuthenticated(false);
      setShowPermissionChangedAlert(false);
      isInitialLoginRef.current = true; // Reset initial login flag
      throw error;
    }
  }, []);

  const handlePermissionChangedConfirm = useCallback(async () => {
    await logout();
    router.replace('/modulo-usuarios/LoginPage');
  }, [logout]);

  // Function to check permissions periodically
  const checkPermissionsPeriodically = useCallback(async () => {
    // Double check authentication status to prevent calls after logout
    const token = await AsyncStorage.getItem('access_token');
    if (!isAuthenticated || !token) {
      console.log('Permission check cancelled: user not authenticated or no token');
      return;
    }

    try {
      // Get current permissions from backend
      const profile = await getProfile();
      const currentPermissions = (profile.rol?.permisos as any[])?.map(p => ({
        modulo: p.recurso.modulo.nombre,
        recurso: p.recurso.nombre,
        accion: p.accion,
      })) || [];

      // Compare with stored permissions
      const storedPermissionsStr = await AsyncStorage.getItem('user_permissions_snapshot');
      if (storedPermissionsStr) {
        const storedPermissions = JSON.parse(storedPermissionsStr);
        const permissionsChanged = !arraysEqual(currentPermissions, storedPermissions);

        // Helper function to check if user is admin
        const isAdmin = user?.rol?.toLowerCase() === 'admin';
        
        console.log('PermissionContext: Periodic check - User role:', user?.rol, 'Is Admin:', isAdmin);

        // Only show alert if permissions changed AND user is not admin
        if (permissionsChanged && !showPermissionChangedAlert && !isAdmin) {
          console.log('PermissionContext: Showing permission changed alert');
          setShowPermissionChangedAlert(true);
          // Update stored permissions
          await AsyncStorage.setItem('user_permissions_snapshot', JSON.stringify(currentPermissions));
        }
      }
    } catch (error) {
      console.error('Error checking permissions periodically:', error);
      
      // Enhanced error handling - try to refresh token first before logout
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAuthError = errorMessage.includes('401') || 
                         errorMessage.includes('Unauthorized') ||
                         errorMessage.includes('Token expired') ||
                         errorMessage.includes('No refresh token');
      
      if (isAuthError) {
        console.log('Auth error detected, attempting token refresh...');
        try {
          // Try to refresh the token first
          await refreshToken();
          console.log('Token refresh successful, retrying permission check...');
          
          // Retry the permission check after successful refresh
          setTimeout(() => {
            checkPermissionsPeriodically();
          }, 1000); // Small delay to ensure refresh is complete
          
          return; // Exit early, don't logout
        } catch (refreshError) {
          console.log('Token refresh failed, performing automatic logout:', refreshError);
          
          // Only logout if refresh also fails
          try {
            if (permissionCheckIntervalRef.current) {
              clearInterval(permissionCheckIntervalRef.current);
              permissionCheckIntervalRef.current = null;
            }
            clearAxiosIntercepts();
            await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_permissions_snapshot']);
            setUser(null);
            setPermissions([]);
            setLastUpdate(Date.now());
            setIsAuthenticated(false);
            setShowPermissionChangedAlert(false);
            isInitialLoginRef.current = true; // Reset initial login flag
            router.replace('/modulo-usuarios/LoginPage');
          } catch (logoutError) {
            console.error('Error during automatic logout:', logoutError);
          }
        }
      } else {
        // For non-auth errors, just log and continue (don't logout)
        console.log('Non-auth error during permission check, continuing...');
      }
    }
  }, [isAuthenticated, showPermissionChangedAlert, user]);

  // Start/stop periodic permission checking
  useEffect(() => {
    const startPermissionChecking = async () => {
      // Clear any existing interval first
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current);
        permissionCheckIntervalRef.current = null;
      }

      // Only start checking if authenticated and has tokens
      if (isAuthenticated && !showPermissionChangedAlert) {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          // Check permissions every 30 seconds
          permissionCheckIntervalRef.current = setInterval(checkPermissionsPeriodically, 30000) as unknown as NodeJS.Timeout;
        }
      }
    };

    startPermissionChecking();

    return () => {
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current);
        permissionCheckIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, showPermissionChangedAlert, checkPermissionsPeriodically]);

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) {
      console.log('PermissionContext: Skipping duplicate initialization');
      return;
    }
    initRef.current = true;

    const init = async () => {
      console.log('PermissionContext: Starting app initialization');

      try {
        // Check if we have access token
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          console.log('PermissionContext: Token found, attempting to get profile...');
          try {
            const profile = await getProfile();
            console.log('PermissionContext: Profile loaded successfully', JSON.stringify(profile, null, 2));
            console.log('PermissionContext: Profile rol:', profile.rol);
            console.log('PermissionContext: Profile rol permisos:', profile.rol?.permisos);
            setUser({
              id: profile.id,
              name: `${profile.nombres} ${profile.apellidos}`,
              email: profile.correo,
              rol: profile.rol?.nombre
            });
            const mappedPermissions = (profile.rol?.permisos as any[])?.map(p => ({
              modulo: p.recurso.modulo.nombre,
              recurso: p.recurso.nombre,
              accion: p.accion,
            })) || [];
            console.log('PermissionContext: Mapped permissions:', JSON.stringify(mappedPermissions, null, 2));
            updatePermissions(mappedPermissions, true); // Mark as initial login
            setIsAuthenticated(true);
            console.log('PermissionContext: User authenticated successfully');
          } catch (error) {
            console.log('PermissionContext: Profile fetch failed, trying refresh token...', error);
            try {
              console.log('PermissionContext: Attempting token refresh...');
              await refreshToken();
              console.log('PermissionContext: Token refresh successful, retrying profile...');
              const profile = await getProfile();
              console.log('PermissionContext: Profile loaded after refresh', profile);
              setUser({
                id: profile.id,
                name: `${profile.nombres} ${profile.apellidos}`,
                email: profile.correo,
                rol: profile.rol?.nombre
              });
              const mappedPermissions = (profile.rol?.permisos as any[])?.map(p => ({
                modulo: p.recurso.modulo.nombre,
                recurso: p.recurso.nombre,
                accion: p.accion,
              })) || [];
              updatePermissions(mappedPermissions, true); // Mark as initial login/refresh
              setIsAuthenticated(true);
              console.log('PermissionContext: User authenticated after refresh');
            } catch (refreshError) {
              console.log('PermissionContext: Token refresh also failed, user not authenticated:', refreshError);
              setUser(null);
              updatePermissions([], true); // Mark as initial login
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log('PermissionContext: No token found, user not authenticated');
          setUser(null);
          updatePermissions([], true); // Mark as initial login
          setIsAuthenticated(false);
        }

        // Setup axios interceptors for automatic token refresh
        setupAxiosIntercepts(refresh, (path: string) => {
          console.log('Navigation to:', path);
          if (path === '/Login') {
            router.replace('/modulo-usuarios/LoginPage');
          } else {
            router.replace(path as any);
          }
        });
      } catch (error) {
        console.log('PermissionContext: Initialization error:', error);
        // Even on error, don't set isInitializing to true since we start with false
      }
    };
    init();
  }, [refresh]);

  const value: PermissionContextType = {
    user,
    permissions,
    lastUpdate,
    isAuthenticated,
    isRefreshing,
    isInitializing,
    hasPermission,
    login,
    logout,
    refresh,
    setUser,
    setPermissions: (permissions: Permission[], isInitialLogin?: boolean) => updatePermissions(permissions, isInitialLogin),
  };

  // Helper function to check if user is admin for rendering
  const isAdmin = user?.rol?.toLowerCase() === 'admin';

  return (
    <PermissionContext.Provider value={value}>
      {children}

      {/* Permission Changed Alert Modal - Only show if user is authenticated, not admin, and alert is active */}
      {isAuthenticated && !isAdmin && showPermissionChangedAlert && (
        <Modal
          visible={showPermissionChangedAlert}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}} // Prevent closing by back button
        >
          <View style={styles.overlay}>
            <View style={styles.alertContainer}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>Permisos Actualizados</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>
                  Sus permisos han sido modificados por un administrador.
                  Para aplicar los cambios, debe cerrar sesión e iniciar nuevamente.
                </Text>
              </View>
              <View style={styles.alertButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handlePermissionChangedConfirm}
                >
                  <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  alertHeader: {
    backgroundColor: '#066839',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  alertContent: {
    padding: 20,
  },
  alertMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  alertButtons: {
    padding: 20,
    paddingTop: 0,
  },
  confirmButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});