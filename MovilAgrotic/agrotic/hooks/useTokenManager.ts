import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshToken, clearAuthData } from '../services/Modulo Usuarios/authService';
import Constants from 'expo-constants';

interface TokenInfo {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isRefreshing: boolean;
  lastRefresh: number | null;
  error: string | null;
}

interface TokenManagerConfig {
  refreshInterval?: number;        // Intervalo de refresh en ms (default: 2 min)
  preRefreshThreshold?: number;    // Tiempo antes de expirar para refresh preventivo (default: 30 seg)
  maxRetries?: number;            // Máximo número de reintentos (default: 3)
  retryDelay?: number;            // Delay entre reintentos en ms (default: 1000)
  enableProactiveRefresh?: boolean; // Habilitar refresh preventivo (default: true)
}

const DEFAULT_CONFIG: Required<TokenManagerConfig> = {
  refreshInterval: 120000,        // 2 minutos
  preRefreshThreshold: 30000,     // 30 segundos antes de expirar
  maxRetries: 3,
  retryDelay: 1000,
  enableProactiveRefresh: true,
};

/**
 * Hook centralizado para gestión de tokens con prevención de race conditions
 * y refresh proactivo antes de expiración
 */
export const useTokenManager = (config: TokenManagerConfig = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Estado centralizado de tokens
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isRefreshing: false,
    lastRefresh: null,
    error: null,
  });

  // Referencias para control interno
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const isRefreshingRef = useRef(false);

  // Función para decodificar JWT y obtener información de expiración
  const decodeToken = useCallback((token: string): { exp: number } | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('TokenManager: Error decoding token:', error);
      return null;
    }
  }, []);

  // Función para cargar información actual del token
  const loadTokenInfo = useCallback(async (): Promise<TokenInfo> => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const refreshTokenValue = await AsyncStorage.getItem('refresh_token');
      
      let expiresAt: number | null = null;
      if (accessToken) {
        const decoded = decodeToken(accessToken);
        if (decoded && decoded.exp) {
          expiresAt = decoded.exp * 1000; // Convertir a milliseconds
        }
      }

      return {
        accessToken,
        refreshToken: refreshTokenValue,
        expiresAt,
        isRefreshing: false,
        lastRefresh: Date.now(),
        error: null,
      };
    } catch (error: any) {
      console.error('TokenManager: Error loading token info:', error);
      return {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        isRefreshing: false,
        lastRefresh: null,
        error: error.message,
      };
    }
  }, [decodeToken]);

  // Función para verificar si el token está próximo a expirar
  const isTokenExpiring = useCallback((expiresAt: number | null, threshold: number = finalConfig.preRefreshThreshold): boolean => {
    if (!expiresAt) return true; // Si no hay expiración, considerar como expirando
    return Date.now() >= (expiresAt - threshold);
  }, [finalConfig.preRefreshThreshold]);

  // Función centralizada de refresh con retry logic
  const performTokenRefresh = useCallback(async (): Promise<boolean> => {
    // Prevenir múltiples refresh simultáneos
    if (isRefreshingRef.current) {
      console.log('TokenManager: Refresh already in progress, skipping...');
      return false;
    }

    isRefreshingRef.current = true;
    setTokenInfo(prev => ({ ...prev, isRefreshing: true, error: null }));

    try {
      console.log('TokenManager: Starting token refresh...');
      
      // Intentar refresh con retry logic
      let success = false;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            // Exponential backoff para reintentos
            const delay = finalConfig.retryDelay * Math.pow(2, attempt - 1);
            console.log(`TokenManager: Retry attempt ${attempt}, waiting ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          await refreshToken();
          success = true;
          console.log(`TokenManager: Refresh successful on attempt ${attempt + 1}`);
          break;
        } catch (error: any) {
          lastError = error;
          console.error(`TokenManager: Refresh attempt ${attempt + 1} failed:`, error.message);
          
          // Si es error de autenticación y no es el último intento, continuar
          if (error.message.includes('401') || error.message.includes('403')) {
            if (attempt === finalConfig.maxRetries) {
              // Último intento falló con error de auth, limpiar tokens
              console.log('TokenManager: Final auth failure, clearing tokens...');
              await clearAuthData();
            }
            continue;
          } else {
            // Error de red u otro, reintentar si hay intentos disponibles
            if (attempt < finalConfig.maxRetries) continue;
          }
        }
      }

      if (success) {
        // Refresh exitoso, actualizar información
        const newTokenInfo = await loadTokenInfo();
        if (mountedRef.current) {
          setTokenInfo(prev => ({
            ...newTokenInfo,
            isRefreshing: false,
            error: null,
          }));
        }
        retryCountRef.current = 0;
        return true;
      } else {
        throw lastError || new Error('All refresh attempts failed');
      }
    } catch (error: any) {
      console.error('TokenManager: Token refresh failed:', error);
      
      if (mountedRef.current) {
        setTokenInfo(prev => ({
          ...prev,
          isRefreshing: false,
          error: error.message,
        }));
      }
      
      // Si es error crítico de autenticación, limpiar tokens
      if (error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('No refresh token')) {
        console.log('TokenManager: Critical auth error, clearing tokens...');
        await clearAuthData();
        if (mountedRef.current) {
          setTokenInfo({
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            isRefreshing: false,
            lastRefresh: null,
            error: null,
          });
        }
      }
      
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [finalConfig, loadTokenInfo]);

  // Función para programar refresh preventivo
  const schedulePreRefresh = useCallback(() => {
    if (!finalConfig.enableProactiveRefresh || !tokenInfo.expiresAt) return;

    // Cancelar timeout anterior
    if (preRefreshTimeoutRef.current) {
      clearTimeout(preRefreshTimeoutRef.current);
    }

    const timeUntilExpiry = tokenInfo.expiresAt - Date.now();
    const preRefreshTime = timeUntilExpiry - finalConfig.preRefreshThreshold;

    if (preRefreshTime > 0) {
      console.log(`TokenManager: Scheduling proactive refresh in ${Math.round(preRefreshTime / 1000)}s`);
      preRefreshTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && tokenInfo.accessToken) {
          console.log('TokenManager: Proactive refresh triggered');
          performTokenRefresh();
        }
      }, preRefreshTime);
    } else {
      // Token ya está próximo a expirar, hacer refresh inmediato
      console.log('TokenManager: Token already expiring, refreshing immediately');
      performTokenRefresh();
    }
  }, [finalConfig, tokenInfo.expiresAt, tokenInfo.accessToken, performTokenRefresh]);

  // Función para programar refresh periódico
  const schedulePeriodicRefresh = useCallback(() => {
    // Cancelar timeout anterior
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    console.log(`TokenManager: Scheduling periodic refresh in ${finalConfig.refreshInterval / 1000}s`);
    refreshTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && tokenInfo.accessToken) {
        console.log('TokenManager: Periodic refresh triggered');
        performTokenRefresh().then(() => {
          // Programar siguiente refresh después del actual
          schedulePeriodicRefresh();
        });
      }
    }, finalConfig.refreshInterval);
  }, [finalConfig.refreshInterval, tokenInfo.accessToken, performTokenRefresh]);

  // Efecto para inicializar y cargar token info
  useEffect(() => {
    const initialize = async () => {
      const info = await loadTokenInfo();
      if (mountedRef.current) {
        setTokenInfo(info);
      }
    };

    initialize();
  }, [loadTokenInfo]);

  // Efecto para programar refresh cuando cambia la información del token
  useEffect(() => {
    if (tokenInfo.accessToken && !tokenInfo.isRefreshing) {
      schedulePreRefresh();
      schedulePeriodicRefresh();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (preRefreshTimeoutRef.current) {
        clearTimeout(preRefreshTimeoutRef.current);
      }
    };
  }, [tokenInfo.accessToken, tokenInfo.expiresAt, tokenInfo.isRefreshing, schedulePreRefresh, schedulePeriodicRefresh]);

  // Efecto de cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (preRefreshTimeoutRef.current) {
        clearTimeout(preRefreshTimeoutRef.current);
      }
    };
  }, []);

  // Funciones públicas
  const forceRefresh = useCallback(async () => {
    console.log('TokenManager: Force refresh requested');
    return await performTokenRefresh();
  }, [performTokenRefresh]);

  const isTokenValid = useCallback(() => {
    return tokenInfo.accessToken && 
           tokenInfo.expiresAt && 
           Date.now() < tokenInfo.expiresAt;
  }, [tokenInfo.accessToken, tokenInfo.expiresAt]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!tokenInfo.expiresAt) return 0;
    return Math.max(0, tokenInfo.expiresAt - Date.now());
  }, [tokenInfo.expiresAt]);

  const clearTokens = useCallback(async () => {
    console.log('TokenManager: Clearing tokens');
    await clearAuthData();
    if (mountedRef.current) {
      setTokenInfo({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        isRefreshing: false,
        lastRefresh: null,
        error: null,
      });
    }
  }, []);

  // Valor memoizado para evitar re-renders innecesarios
  const tokenManagerValue = useMemo(() => ({
    // Estado
    tokenInfo,
    isTokenValid: isTokenValid(),
    timeUntilExpiry: getTimeUntilExpiry(),
    
    // Estado booleano útil
    hasToken: !!tokenInfo.accessToken,
    isRefreshing: tokenInfo.isRefreshing,
    hasError: !!tokenInfo.error,
    
    // Funciones
    forceRefresh,
    clearTokens,
    loadTokenInfo,
    
    // Información de debug
    debug: {
      expiresAt: tokenInfo.expiresAt,
      lastRefresh: tokenInfo.lastRefresh,
      retryCount: retryCountRef.current,
      config: finalConfig,
    }
  }), [
    tokenInfo,
    isTokenValid,
    getTimeUntilExpiry,
    forceRefresh,
    clearTokens,
    loadTokenInfo,
    finalConfig,
  ]);

  return tokenManagerValue;
};

export default useTokenManager;