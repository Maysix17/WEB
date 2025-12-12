import apiClient from "@/services/General/axios/axios";
import type { ItemSensor } from "@/types/Modulo Sensores/Sensores.types";

export const sensorService = {
  getAll: async (): Promise<ItemSensor[]> => {
    try {
      const response = await apiClient.get("/sensor");
      return response.data;
    } catch (error) {
      console.error("Error fetching sensors:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<ItemSensor> => {
    try {
      const response = await apiClient.get(`/sensor/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sensor:", error);
      throw error;
    }
  },

  create: async (data: Partial<ItemSensor>): Promise<ItemSensor> => {
    try {
      const response = await apiClient.post("/sensor", data);
      return response.data;
    } catch (error) {
      console.error("Error creating sensor:", error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<ItemSensor>): Promise<ItemSensor> => {
    try {
      const response = await apiClient.patch(`/sensor/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating sensor:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/sensor/${id}`);
    } catch (error) {
      console.error("Error deleting sensor:", error);
      throw error;
    }
  },
};