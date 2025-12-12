import apiClient from "@/services/General/axios/axios";

export interface Profile {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  dni: number;
  telefono?: string;
  ficha?: {
    numero: string;
  };
  rol: {
    id: string;
    nombre: string;
    permisos: Array<{
      id: string;
      recurso: {
        id: string;
        nombre: string;
        modulo: {
          id: string;
          nombre: string;
        };
      };
      accion: string;
    }>;
  };
}

export const getProfile = async (): Promise<Profile> => {
  try {
    const response = await apiClient.get('/usuarios/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};