import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuración centralizada de la aplicación
// Edita solo el app.json para cambiar la API URL

interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  imageBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  timeout: number;
  retries: number;
}

// URLs de fallback para desarrollo local
const FALLBACK_URLS = {
  development: 'http://192.168.101.4:3000',
  staging: 'https://staging-api.agrotic.com',
  production: 'https://api.agrotic.com',
};

// Función para obtener la API URL con fallbacks
const getApiUrl = (): string => {
  try {
    // 1. Intentar obtener de app.json
    const configUrl = Constants.expoConfig?.extra?.apiUrl;
    if (configUrl && configUrl.trim() !== '') {
      console.log('✅ Using API URL from app.json:', configUrl);
      return configUrl;
    }
    
    // 2. Fallback según el entorno
    const environment = getEnvironment();
    const fallbackUrl = FALLBACK_URLS[environment];
    if (fallbackUrl) {
      console.warn('⚠️ Using fallback URL for environment:', environment, fallbackUrl);
      return fallbackUrl;
    }
    
    // 3. Fallback final para desarrollo
    console.warn('⚠️ Using default development URL');
    return FALLBACK_URLS.development;
  } catch (error) {
    console.error('❌ Error getting API URL:', error);
    return FALLBACK_URLS.development;
  }
};

// Función para determinar el entorno
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  try {
    // Detectar entorno basado en la URL de la API
    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (apiUrl) {
      if (apiUrl.includes('ngrok-free.dev') || 
          apiUrl.includes('localhost') || 
          apiUrl.includes('192.168.') ||
          apiUrl.includes('127.0.0.1')) {
        return 'development';
      }
      if (apiUrl.includes('staging') || apiUrl.includes('test')) {
        return 'staging';
      }
      return 'production';
    }
    
    // Fallback basado en plataforma
    if (__DEV__) {
      return 'development';
    }
    
    return 'production';
  } catch (error) {
    console.error('Error determining environment:', error);
    return 'development';
  }
};

// Configuración principal
const appConfig: AppConfig = {
  apiUrl: getApiUrl(),
  wsUrl: getApiUrl().replace('http', 'ws'),
  imageBaseUrl: getApiUrl(),
  environment: getEnvironment(),
  isDevelopment: getEnvironment() === 'development',
  isStaging: getEnvironment() === 'staging',
  isProduction: getEnvironment() === 'production',
  timeout: 10000, // 10 segundos
  retries: 3,
};

// Funciones utilitarias
export const config = {
  // URLs principales
  api: {
    url: appConfig.apiUrl,
    wsUrl: appConfig.wsUrl,
    imageUrl: (path: string) => {
      // Si la URL ya es absoluta, devolverla tal como está
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // Remover slash inicial para evitar doble slash
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${appConfig.imageBaseUrl}/${cleanPath}`;
    },
  },
  
  // Información del entorno
  environment: {
    current: appConfig.environment,
    isDevelopment: appConfig.isDevelopment,
    isStaging: appConfig.isStaging,
    isProduction: appConfig.isProduction,
  },
  
  // Configuración de red
  network: {
    timeout: appConfig.timeout,
    retries: appConfig.retries,
  },
  
  // Utilidades
  utils: {
    getApiUrl: () => appConfig.apiUrl,
    getWsUrl: () => appConfig.wsUrl,
    getEnvironment: () => appConfig.environment,
    isDevelopment: () => appConfig.isDevelopment,
    isProduction: () => appConfig.isProduction,
    isStaging: () => appConfig.isStaging,
  },
};

// Log de configuración al inicializar
console.log('🚀 AgroTic App Configuration:', {
  environment: appConfig.environment,
  apiUrl: appConfig.apiUrl,
  wsUrl: appConfig.wsUrl,
  isDevelopment: appConfig.isDevelopment,
});

export default config;