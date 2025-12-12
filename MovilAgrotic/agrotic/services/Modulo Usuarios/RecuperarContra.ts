// Importar cliente Axios configurado para llamadas API
import apiClient from "@/services/General/axios/axios";
import { createPasswordResetLink } from "@/utils/deepLinking";

// Función para solicitar recuperación de contraseña enviando email
export const recoverPassword = async (email: string): Promise<any> => {
  try {
    // Enviar email al backend para iniciar proceso de recuperación
    // Especificar explícitamente que es desde móvil para obtener deep links
    const response = await apiClient.post("/auth/forgot-password", {
      email,
      platform: 'mobile'
    });
    return response.data;
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error);
    throw error;
  }
};

// Función para restablecer contraseña usando token y nuevas contraseñas
export const resetPassword = async (token: string, newPassword: string, repetPassword: string): Promise<any> => {
  try {
    // Enviar token y contraseñas al backend para actualizar
    const response = await apiClient.patch(`/auth/reset-password?token=${token}`, { newPassword, repetPassword });
    return response.data;
  } catch (error) {
    console.error("Error en restablecimiento de contraseña:", error);
    throw error;
  }
};
