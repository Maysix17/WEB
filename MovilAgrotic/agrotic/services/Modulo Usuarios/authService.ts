// Importaciones: cliente Axios, AsyncStorage para almacenamiento local, y tipos de autenticación
import apiClient from "@/services/General/axios/axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RegisterPayload, RegisterFormData, LoginPayload } from "@/types/Modulo Usuarios/auth";

// Variables globales para control de frecuencia
let isInitializing = false;
let initializationPromise: Promise<boolean> | null = null;
let isVerifyingAuth = false;
let authVerificationPromise: Promise<boolean> | null = null;

// Función para registrar un nuevo usuario en el sistema agrícola
export const registerUser = async (
  formData: RegisterFormData
): Promise<any> => {

  console.log("AuthService: Register attempt started");
  
  try {
    // Mapeo y conversión de datos del formulario al payload esperado por el backend
    const payload: RegisterPayload = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      dni: parseInt(formData.dni, 10), // Convierte string a número
      telefono: parseInt(formData.telefono, 10), // Convierte string a número
      correo: formData.email, // Mapea 'email' del form a 'correo' del backend
      password: formData.password,
    };

    console.log("AuthService: Register payload prepared");

    // Envía la solicitud de registro al backend
    const response = await apiClient.post("/auth/register", payload);

    console.log("AuthService: Register successful");
    return response.data;

  } catch (error) {
    console.error("AuthService: Register failed:", error);
    // Lanza el error para manejo en el componente
    throw error;
  }
};

// Función para cerrar sesión del usuario
export const logoutUser = async (): Promise<void> => {
  try {
    // Notifica al backend del logout
    await apiClient.post("/auth/logout");
    // Elimina tokens del almacenamiento local
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    // Remueve el header de autorización del cliente Axios
    delete apiClient.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

// Función para iniciar sesión de un usuario
export const loginUser = async (payload: LoginPayload): Promise<any> => {
  try {
    console.log("AuthService: Login attempt for DNI:", payload.dni);
    
    // Envía credenciales al backend para autenticación
    const response = await apiClient.post("/auth/login", payload);
    
    console.log("AuthService: Login response received");
    
    // Si se recibe token de acceso, configúralo en Axios y almacénalo
    if (response.data.access_token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      // Guarda tokens en AsyncStorage para persistencia
      await AsyncStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      console.log("AuthService: Tokens stored successfully");
    }
    
    return response.data;
  } catch (error) {
    console.error("AuthService: Login failed:", error);
    throw error;
  }
};

// Función mejorada para refrescar el token de acceso expirado con retry logic
export const refreshToken = async (): Promise<void> => {
  console.log("AuthService: Attempting to refresh token");

  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Obtener el refresh token del almacenamiento
      const refreshTokenValue = await AsyncStorage.getItem('refresh_token');

      if (!refreshTokenValue) {
        console.error("AuthService: No refresh token found in storage");
        throw new Error('No refresh token available');
      }

      console.log(`AuthService: Refresh attempt ${attempt}/${maxRetries}, calling backend...`);

      // Call refresh endpoint with refresh token in request body
      const response = await apiClient.post("/auth/refresh", {
        refreshToken: refreshTokenValue
      });

      console.log("AuthService: Token refresh successful");
      console.log("AuthService: Refresh response status:", response.status);

      // Validar que la respuesta contiene los tokens esperados
      if (!response.data) {
        throw new Error('Empty response from refresh endpoint');
      }

      // Actualiza el token si se recibió uno nuevo
      if (response.data.access_token) {
        console.log("AuthService: Updating access token...");
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        await AsyncStorage.setItem('access_token', response.data.access_token);
        console.log("AuthService: Access token updated successfully");

        // Si viene un nuevo refresh token, actualizarlo también
        if (response.data.refresh_token) {
          console.log("AuthService: Updating refresh token...");
          await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
          console.log("AuthService: Refresh token updated successfully");
        }
      } else {
        console.error("AuthService: No access token in response:", response.data);
        throw new Error('No access token received from refresh');
      }
      
      console.log("AuthService: Token refresh completed successfully");
      return; // Success, exit the retry loop
      
    } catch (error: any) {
      lastError = error;
      console.error(`AuthService: Refresh attempt ${attempt} failed:`, error.message);
      console.error("AuthService: Refresh error response:", error.response?.data);
      
      // Si es el último intento o es un error crítico de autenticación, no reintentar
      const isAuthError = error.response?.status === 401 || 
                         error.response?.status === 403 ||
                         error.message.includes('No refresh token');
      
      if (attempt === maxRetries || isAuthError) {
        break; // Exit retry loop on last attempt or critical auth error
      }
      
      // Esperar antes del siguiente intento (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      console.log(`AuthService: Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error("AuthService: All refresh attempts failed");
  
  // Manejo mejorado de errores del último intento
  let shouldClearTokens = false;
  let errorMessage = 'Token refresh failed';

  if (lastError?.response) {
    // Error del servidor
    switch (lastError.response.status) {
      case 401:
        errorMessage = 'Refresh token expired or invalid';
        shouldClearTokens = true;
        break;
      case 403:
        errorMessage = 'Refresh token forbidden';
        shouldClearTokens = true;
        break;
      case 400:
        errorMessage = 'Invalid refresh token format';
        shouldClearTokens = true;
        break;
      default:
        errorMessage = `Server error: ${lastError.response.status}`;
    }
  } else if (lastError?.code === 'NETWORK_ERROR' || !lastError?.response) {
    errorMessage = 'Network error during token refresh';
  } else if (lastError?.code === 'ECONNABORTED') {
    errorMessage = 'Token refresh request timeout';
  }

  // Limpiar tokens en casos específicos de error de autenticación
  if (shouldClearTokens ||
      lastError?.message?.includes('401') ||
      lastError?.message?.includes('Unauthorized') ||
      lastError?.message?.includes('Token expired') ||
      lastError?.message?.includes('No refresh token') ||
      lastError?.message?.includes('Refresh token')) {
     
    console.log("AuthService: Cleaning up tokens due to auth error");
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    delete apiClient.defaults.headers.common['Authorization'];
  }
  
  throw new Error(errorMessage);
};

// Función para inicializar la autenticación al abrir la app (carga token guardado)
export const initializeAuth = async (): Promise<boolean> => {
  // Prevenir múltiples inicializaciones simultáneas
  if (isInitializing && initializationPromise) {
    console.log("AuthService: Initialization already in progress, waiting...");
    return initializationPromise;
  }

  isInitializing = true;
  
  initializationPromise = (async (): Promise<boolean> => {
    try {
      console.log("AuthService: Starting authentication initialization...");
      
      // Recupera el token de AsyncStorage
      const token = await AsyncStorage.getItem('access_token');
      const refreshTokenValue = await AsyncStorage.getItem('refresh_token');
      
      if (!token || !refreshTokenValue) {
        console.log("AuthService: No tokens found in storage");
        isInitializing = false;
        return false;
      }

      console.log("AuthService: Tokens found, setting up authorization...");
      
      // Configura el header de autorización en Axios
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verifica si el token es válido haciendo una petición de prueba
      try {
        await apiClient.get("/auth/verify-token");
        console.log("AuthService: Token validation successful");
        isInitializing = false;
        return true;
      } catch (verifyError: any) {
        console.log("AuthService: Token validation failed, attempting refresh...");
        
        // Si el token está expirado, intenta refrescarlo
        if (verifyError.response?.status === 401) {
          try {
            await refreshToken();
            console.log("AuthService: Token refreshed successfully during initialization");
            isInitializing = false;
            return true;
          } catch (refreshError) {
            console.error("AuthService: Token refresh failed during initialization:", refreshError);
            // Limpia tokens inválidos
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            delete apiClient.defaults.headers.common['Authorization'];
            isInitializing = false;
            return false;
          }
        } else {
          throw verifyError;
        }
      }
    } catch (error) {
      console.error("AuthService: Error during initialization:", error);
      isInitializing = false;
      return false;
    }
  })();

  return initializationPromise;
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  // Prevenir múltiples verificaciones simultáneas
  if (isVerifyingAuth && authVerificationPromise) {
    console.log("AuthService: Verification already in progress, waiting...");
    return authVerificationPromise;
  }

  isVerifyingAuth = true;
  
  authVerificationPromise = (async (): Promise<boolean> => {
    try {
      console.log("AuthService: Starting authentication verification...");
      
      const token = await AsyncStorage.getItem('access_token');
      const refreshTokenValue = await AsyncStorage.getItem('refresh_token');
      
      if (!token || !refreshTokenValue) {
        console.log("AuthService: No tokens found for verification");
        isVerifyingAuth = false;
        return false;
      }

      // Verifica el token con el servidor
      const response = await apiClient.get("/auth/verify-token");
      
      console.log("AuthService: Verification successful");
      isVerifyingAuth = false;
      return response.status === 200;
    } catch (error) {
      console.log("AuthService: Verification failed:", error);
      isVerifyingAuth = false;
      return false;
    }
  })();

  return authVerificationPromise;
};

// Función para limpiar todos los datos de autenticación
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    delete apiClient.defaults.headers.common['Authorization'];
    console.log("AuthService: Auth data cleared");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};