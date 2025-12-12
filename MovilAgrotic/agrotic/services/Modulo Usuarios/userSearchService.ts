// Importaciones: cliente Axios y tipos para usuarios y respuestas paginadas
import apiClient from "@/services/General/axios/axios";
import type { Usuario, RespuestaPaginada } from "@/types/Modulo Usuarios/Usuarios.types";

// Servicio para buscar usuarios en el sistema agrícola
const userSearchService = {
  // Función para buscar usuarios por query con paginación
  search: async (query: string, page: number = 1, limit: number = 10): Promise<RespuestaPaginada<Usuario>> => {
    try {
      const response = await apiClient.get(`/usuarios/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  },

  // Función para buscar usuarios por DNI
  searchByDni: async (dni: string): Promise<Usuario[]> => {
    try {
      const response = await apiClient.get(`/usuarios/search/dni/${dni}`);
      return response.data;
    } catch (error) {
      console.error("Error searching user by DNI:", error);
      throw error;
    }
  },
};

export default userSearchService;