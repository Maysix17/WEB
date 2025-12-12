import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Safer base URL configuration with fallback
const getBaseURL = () => {
  const config = Constants.expoConfig?.extra?.apiUrl;
  if (!config) {
    console.warn('API URL not configured, using default fallback');
    return 'http://localhost:3000'; // Fallback for development
  }
  return config;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Global throttling for API requests
let lastRequestTime = 0;
const MIN_REQUEST_DELAY = 150; // 150ms minimum delay between requests
let requestQueue: Array<() => void> = [];
let isProcessingQueue = false;

// Función para procesar cola de requests con throttling
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const processNext = requestQueue.shift();
    if (processNext) {
      await processNext();
      // Throttle entre requests en la cola
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_DELAY));
    }
  }
  
  isProcessingQueue = false;
};

// Add request interceptor for logging, auth, and throttling
apiClient.interceptors.request.use(
  async (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);

    // Add authorization header if token exists and not already present
    if (!config.headers.Authorization) {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting token from storage:', error);
      }
    }

    // Throttle requests to avoid rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
      const delay = MIN_REQUEST_DELAY - timeSinceLastRequest;
      console.log(`Throttling API request by ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    lastRequestTime = Date.now();

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message, error.config?.url);
    
    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('La solicitud ha expirado. Por favor, inténtalo de nuevo.'));
    }
    
    if (!error.response) {
      console.error('Network error - no response received');
      return Promise.reject(new Error('Error de conectividad. Verifica tu conexión a internet.'));
    }
    
    return Promise.reject(error);
  }
);

let refreshFunction: (() => Promise<void>) | null = null;
let navigateFunction: ((path: string) => void) | null = null;
let isRefreshing = false; // Flag to prevent multiple simultaneous refresh attempts
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

export const setupAxiosIntercepts = (refresh: () => Promise<void>, navigate: (path: string) => void) => {
  refreshFunction = refresh;
  navigateFunction = navigate;

  // Response interceptor for token refresh with improved logic
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Only try to refresh on 401 errors
      if (error.response?.status === 401 &&
          refreshFunction &&
          !originalRequest._retry) {

        // Enhanced endpoint checking - allow refresh for user profile endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/') && 
                               !originalRequest.url?.includes('/usuarios/me');
        
        // Allow refresh for profile, permissions, and user-related endpoints
        const isUserEndpoint = originalRequest.url?.includes('/usuarios/me') ||
                               originalRequest.url?.includes('/permisos') ||
                               originalRequest.url?.includes('/profile');

        // Skip refresh only for login and refresh token endpoints themselves
        if (isAuthEndpoint && !isUserEndpoint) {
          console.log('Skipping token refresh for auth endpoint:', originalRequest.url);
          return Promise.reject(error);
        }

        // Check if we have a refresh token before attempting refresh
        const refreshTokenValue = await AsyncStorage.getItem('refresh_token');
        if (!refreshTokenValue) {
          console.log('No refresh token available, navigating to login');
          // Clear any remaining tokens
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          // Navigate to login directly
          if (navigateFunction) {
            navigateFunction('/Login');
          }
          return Promise.reject(new Error('No refresh token available'));
        }

        if (isRefreshing) {
          // If refresh is already in progress, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('Attempting token refresh for endpoint:', originalRequest.url);
          await refreshFunction();
          
          // Process queued requests
          processQueue();
          
          // Get the new token and update the request
          const newToken = await AsyncStorage.getItem('access_token');

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('Retrying request with new token...');
            isRefreshing = false;
            return apiClient(originalRequest);
          } else {
            throw new Error('No new token available after refresh');
          }
        } catch (refreshError: any) {
          console.error('Token refresh failed:', refreshError);
          
          // Enhanced error handling - only logout on specific auth errors
          const errorMessage = refreshError.message || '';
          const shouldLogout = errorMessage.includes('401') || 
                              errorMessage.includes('403') ||
                              errorMessage.includes('Unauthorized') ||
                              errorMessage.includes('No refresh token') ||
                              errorMessage.includes('Refresh token expired');
          
          // Process queue with error
          processQueue(refreshError);
          
          if (shouldLogout) {
            // Clear auth state on refresh failure
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            isRefreshing = false;

            // Navigate to login on refresh failure
            if (navigateFunction) {
              navigateFunction('/Login');
            }
          }
          
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Function to clear axios intercepts (useful for logout)
export const clearAxiosIntercepts = () => {
  refreshFunction = null;
  navigateFunction = null;
  isRefreshing = false;
  failedQueue = [];
  requestQueue = [];
  isProcessingQueue = false;
  lastRequestTime = 0;
};

// Function to get axios statistics (useful for debugging)
export const getAxiosStats = () => {
  return {
    isRefreshing,
    failedQueueLength: failedQueue.length,
    requestQueueLength: requestQueue.length,
    isProcessingQueue,
    timeSinceLastRequest: Date.now() - lastRequestTime,
  };
};

export default apiClient;
