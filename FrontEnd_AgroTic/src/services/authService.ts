import apiClient from "../lib/axios/axios";
import type { RegisterPayload, RegisterFormData, LoginPayload } from "../types/Auth";

export const registerUser = async (
  formData: RegisterFormData
): Promise<any> => {

  console.log(apiClient)
  try {
    // Mapeo y conversión de datos para el backend
    const payload: RegisterPayload = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      dni: parseInt(formData.dni, 10),
      telefono: parseInt(formData.telefono, 10),
      correo: formData.email, // Mapeo de 'email' a 'correo'
      password: formData.password,
    };
    console.log(payload)


    const response = await apiClient.post("/auth/register", payload);


    return response.data;

    console.log(payload)
    console.log(response)

  } catch (error) {
    console.error("Error en el registro:", error);
    // Puedes manejar el error de forma más específica si lo necesitas
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/logout");
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export const loginUser = async (payload: LoginPayload): Promise<void> => {
  try {
    console.log("AuthService: Attempting login with payload:", { ...payload, password: '[REDACTED]' });
    const response = await apiClient.post("/auth/login", payload);
    console.log("AuthService: Login response:", response.data);
    console.log("AuthService: Cookies after login:", document.cookie);
    return response.data;
  } catch (error) {
    console.error("AuthService: Login failed:", error);
    console.error("AuthService: Login error response:", (error as any)?.response?.data);
    throw error;
  }
};

export const refreshToken = async (): Promise<void> => {
  console.log("AuthService: Attempting to refresh token");
  console.log("AuthService: Current cookies for refresh:", document.cookie);

  try {
    const response = await apiClient.post("/auth/refresh");
    console.log("AuthService: Token refresh successful, new cookies:", document.cookie);
    console.log("AuthService: Refresh response:", response.data);
  } catch (error) {
    console.error("AuthService: Refresh failed:", error);
    console.error("AuthService: Refresh error response:", (error as any)?.response);
    throw error;
  }
};

export const registerAdminUser = async (formData: any): Promise<any> => {
  const response = await apiClient.post("/usuarios/register", formData);
  return response.data;
};

