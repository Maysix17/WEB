import apiClient from "@/services/General/axios/axios";
import type { UpdateCantidadPlantasDto } from "@/types/Modulo Cultivos/Cultivos.types";

export const cultivosVariedadZonaService = {
  actualizarCantidadPlantas: async (id: string, data: UpdateCantidadPlantasDto): Promise<any> => {
    try {
      const response = await apiClient.post(`/cultivos-variedad-x-zona/${id}/cantidad-plantas`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating cantidad plantas:", error);
      throw error;
    }
  },

  actualizarEstadoFenologico: async (id: string, estadoId: number): Promise<any> => {
    try {
      const response = await apiClient.put(`/cultivos-variedad-x-zona/${id}/estado-fenologico`, {
        fk_estado_fenologico: estadoId
      });
      return response.data;
    } catch (error) {
      console.error("Error updating estado fenologico:", error);
      throw error;
    }
  },

  calcularEdadCultivo: (fechaSiembra: string): number => {
    const siembra = new Date(fechaSiembra);
    const hoy = new Date();
    return Math.floor((hoy.getTime() - siembra.getTime()) / (1000 * 60 * 60 * 24));
  },
};