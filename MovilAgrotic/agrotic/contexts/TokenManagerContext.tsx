import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTokenManager } from '../hooks/useTokenManager';

interface TokenManagerContextType {
  // Estado del token
  tokenInfo: any;
  isTokenValid: boolean;
  timeUntilExpiry: number;
  hasToken: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  
  // Funciones
  forceRefresh: () => Promise<boolean>;
  clearTokens: () => Promise<void>;
  loadTokenInfo: () => Promise<any>;
  
  // Debug
  debug: any;
}

const TokenManagerContext = createContext<TokenManagerContextType | null>(null);

interface TokenManagerProviderProps {
  children: ReactNode;
  config?: {
    refreshInterval?: number;
    preRefreshThreshold?: number;
    maxRetries?: number;
    retryDelay?: number;
    enableProactiveRefresh?: boolean;
  };
}

/**
 * Provider global para gestión centralizada de tokens
 * Previene race conditions y coordina refresh entre componentes
 */
export const TokenManagerProvider: React.FC<TokenManagerProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const tokenManager = useTokenManager(config);

  // Log del estado para debugging
  useEffect(() => {
    console.log('TokenManagerProvider: State updated:', {
      hasToken: tokenManager.hasToken,
      isValid: tokenManager.isTokenValid,
      timeUntilExpiry: Math.round(tokenManager.timeUntilExpiry / 1000),
      isRefreshing: tokenManager.isRefreshing,
      hasError: tokenManager.hasError,
    });
  }, [tokenManager.hasToken, tokenManager.isTokenValid, tokenManager.timeUntilExpiry, tokenManager.isRefreshing, tokenManager.hasError]);

  const contextValue: TokenManagerContextType = {
    tokenInfo: tokenManager.tokenInfo,
    isTokenValid: Boolean(tokenManager.isTokenValid),
    timeUntilExpiry: tokenManager.timeUntilExpiry,
    hasToken: tokenManager.hasToken,
    isRefreshing: tokenManager.isRefreshing,
    hasError: tokenManager.hasError,
    forceRefresh: tokenManager.forceRefresh,
    clearTokens: tokenManager.clearTokens,
    loadTokenInfo: tokenManager.loadTokenInfo,
    debug: tokenManager.debug,
  };

  return (
    <TokenManagerContext.Provider value={contextValue}>
      {children}
    </TokenManagerContext.Provider>
  );
};

/**
 * Hook para usar el token manager desde cualquier componente
 */
export const useGlobalTokenManager = (): TokenManagerContextType => {
  const context = useContext(TokenManagerContext);
  if (!context) {
    throw new Error('useGlobalTokenManager must be used within a TokenManagerProvider');
  }
  return context;
};

export default TokenManagerProvider;