import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { 
  initializeAuth, 
  isAuthenticated, 
  refreshToken, 
  clearAuthData, 
  logoutUser 
} from '@/services/Modulo Usuarios/authService';
import { setupAxiosIntercepts, clearAxiosIntercepts } from '@/services/General/axios/axios';
import type { AuthState, User } from '@/types/Modulo Usuarios/auth';

/**
 * Ejemplo de componente que muestra cómo usar las funciones mejoradas de autenticación
 */
const AuthExample: React.FC = () => {
  const navigation = useNavigation();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
    error: null,
  });

  // Función para cargar el estado de autenticación
  const loadAuthState = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const authenticated = await isAuthenticated();
      
      if (authenticated) {
        // Obtener información del usuario desde AsyncStorage
        // (esto sería parte de tu lógica de estado global)
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          loading: false,
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
        }));
      }
    } catch (error: any) {
      console.error('Error loading auth state:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        isAuthenticated: false,
      }));
    }
  }, []);

  // Inicializar autenticación al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = await initializeAuth();
        
        if (isAuth) {
          // Configurar interceptores solo si está autenticado
          setupAxiosIntercepts(
            refreshToken,
            (path: string) => navigation.navigate(path as never)
          );
          
          await loadAuthState();
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
          // Redirigir a login si no está autenticado
          navigation.navigate('Login' as never);
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    };

    initAuth();

    // Cleanup al desmontar
    return () => {
      clearAxiosIntercepts();
    };
  }, [navigation, loadAuthState]);

  // Recargar estado cuando el componente vuelve a focus
  useFocusEffect(
    useCallback(() => {
      loadAuthState();
    }, [loadAuthState])
  );

  // Función de logout mejorada
  const handleLogout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Logout en el servidor
      await logoutUser();
      
      // Limpiar datos locales
      await clearAuthData();
      
      // Limpiar interceptores
      clearAxiosIntercepts();
      
      // Actualizar estado local
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
      });
      
      // Redirigir a login
      navigation.navigate('Login' as never);
      
      Alert.alert('Éxito', 'Sesión cerrada correctamente');
    } catch (error: any) {
      console.error('Error during logout:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      Alert.alert('Error', 'Error al cerrar sesión: ' + error.message);
    }
  };

  // Función para forzar refresh manual
  const handleManualRefresh = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await refreshToken();
      await loadAuthState();
      Alert.alert('Éxito', 'Token refrescado correctamente');
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      Alert.alert('Error', 'Error al refrescar token: ' + error.message);
    }
  };

  if (authState.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Ejemplo de Autenticación Mejorada
      </Text>

      {authState.error && (
        <View style={{ 
          backgroundColor: '#ffebee', 
          padding: 10, 
          marginBottom: 20,
          borderRadius: 5 
        }}>
          <Text style={{ color: '#c62828' }}>Error: {authState.error}</Text>
        </View>
      )}

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Estado: {authState.isAuthenticated ? 'Autenticado' : 'No autenticado'}
      </Text>

      {authState.user && (
        <View style={{ marginBottom: 20 }}>
          <Text>Usuario: {authState.user.nombres} {authState.user.apellidos}</Text>
          <Text>Email: {authState.user.email}</Text>
          <Text>DNI: {authState.user.dni}</Text>
        </View>
      )}

      <View style={{ gap: 10 }}>
        {authState.isAuthenticated ? (
          <>
            <Button 
              title="Forzar Refresh de Token" 
              onPress={handleManualRefresh}
            />
            <Button 
              title="Cerrar Sesión" 
              onPress={handleLogout}
              color="#d32f2f"
            />
          </>
        ) : (
          <Button 
            title="Ir a Login" 
            onPress={() => navigation.navigate('Login' as never)}
          />
        )}
        
        <Button 
          title="Recargar Estado" 
          onPress={loadAuthState}
        />
      </View>

      <Text style={{ 
        marginTop: 30, 
        fontSize: 12, 
        color: '#666' 
      }}>
        Funciones implementadas:
        {'\n'}- initializeAuth(): Inicialización automática
        {'\n'}- isAuthenticated(): Verificación de estado
        {'\n'}- refreshToken(): Refresh mejorado con queue
        {'\n'}- clearAuthData(): Limpieza completa
        {'\n'}- Manejo robusto de errores
        {'\n'}- Sistema de interceptores automático
      </Text>
    </View>
  );
};

export default AuthExample;

/**
 * HOOK PERSONALIZADO para usar en otros componentes
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
    error: null,
  });

  const loadAuthState = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const authenticated = await isAuthenticated();
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: authenticated,
        loading: false,
      }));
      
      return authenticated;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        isAuthenticated: false,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      await logoutUser();
      await clearAuthData();
      clearAxiosIntercepts();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  return {
    ...authState,
    loadAuthState,
    logout,
    refreshToken,
  };
};