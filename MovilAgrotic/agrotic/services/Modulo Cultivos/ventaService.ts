import apiClient from "@/services/General/axios/axios";
import type { Venta } from "@/types/Modulo Cultivos/Venta.types";

export const ventaService = {
  createVenta: async (data: Omit<Venta, 'id'>): Promise<Venta> => {
    try {
      const response = await apiClient.post('/venta', data);
      return response.data;
    } catch (error) {
      console.error("Error creating venta:", error);
      throw error;
    }
  },

  getVentas: async (): Promise<Venta[]> => {
    try {
      const response = await apiClient.get('/venta');
      return response.data;
    } catch (error) {
      console.error("Error fetching ventas:", error);
      throw error;
    }
  },

  updateVenta: async (id: string, data: Partial<Venta>): Promise<Venta> => {
    try {
      const response = await apiClient.patch(`/venta/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating venta:", error);
      throw error;
    }
  },

  deleteVenta: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/venta/${id}`);
    } catch (error) {
      console.error("Error deleting venta:", error);
      throw error;
    }
  },
};