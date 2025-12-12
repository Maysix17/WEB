import apiClient from "../lib/axios/axios";

export const recoverPassword = async (email: string): Promise<any> => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error);
    throw error;
  }
};
