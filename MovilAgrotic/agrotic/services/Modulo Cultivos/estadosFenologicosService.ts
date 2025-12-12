import apiClient from "@/services/General/axios/axios";
import type { EstadoFenologico } from "@/types/Modulo Cultivos/Cultivos.types";
import { handleDeletionError } from "@/utils/errorHandling";

export const estadosFenologicosService = {
  getEstadosFenologicos: async (): Promise<EstadoFenologico[]> => {
    try {
      const response = await apiClient.get('/estados-fenologicos');
      return response.data;
    } catch (error) {
      console.error("Error fetching estados fenologicos:", error);
      throw error;
    }
  },

  createEstadoFenologico: async (data: Omit<EstadoFenologico, 'id'>): Promise<EstadoFenologico> => {
    try {
      const response = await apiClient.post('/estados-fenologicos', data);
      return response.data;
    } catch (error) {
      console.error("Error creating estado fenologico:", error);
      throw error;
    }
  },

  updateEstadoFenologico: async (id: number, data: Partial<EstadoFenologico>): Promise<EstadoFenologico> => {
    try {
      const response = await apiClient.patch(`/estados-fenologicos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating estado fenologico:", error);
      throw error;
    }
  },

  deleteEstadoFenologico: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/estados-fenologicos/${id}`);
    } catch (error: any) {
      // Enhance the error with a more user-friendly message
      const friendlyMessage = handleDeletionError(error, 'estado fenológico');
      const enhancedError = new Error(friendlyMessage);
      enhancedError.cause = error;
      throw enhancedError;
    }
  },

  checkAssociatedRecords: async (id: number): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/estados-fenologicos/${id}/check-associated`);
      return response.data;
    } catch (error) {
      console.error("Error checking associated records:", error);
      // Por seguridad, asumir que hay registros asociados si hay error
      return true;
    }
  },
};