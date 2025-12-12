import apiClient from "@/services/General/axios/axios";
import type { Cosecha, CreateCosechaDto } from "@/types/Modulo Cultivos/Cosechas.types";

// Individual exports for compatibility
export const createCosecha = async (data: CreateCosechaDto): Promise<Cosecha> => {
  try {
    const response = await apiClient.post('/cosechas', data);
    return response.data;
  } catch (error) {
    console.error("Error creating cosecha:", error);
    throw error;
  }
};

export const getCosechas = async (): Promise<Cosecha[]> => {
  try {
    const response = await apiClient.get('/cosechas');
    return response.data;
  } catch (error) {
    console.error("Error fetching cosechas:", error);
    throw error;
  }
};

export const getCosechasToday = async (): Promise<Cosecha[]> => {
  try {
    const response = await apiClient.get('/cosechas/today');
    return response.data;
  } catch (error) {
    console.error("Error fetching cosechas today:", error);
    throw error;
  }
};

export const getCosechasByCultivo = async (cvzId: string): Promise<Cosecha[]> => {
  try {
    const response = await apiClient.get(`/cosechas/cultivo/${cvzId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cosechas by cultivo:", error);
    throw error;
  }
};

export const getCosechasAbiertasByCultivo = async (cvzId: string): Promise<Cosecha[]> => {
  try {
    const response = await apiClient.get(`/cosechas/cultivo/${cvzId}/abiertas`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cosechas abiertas by cultivo:", error);
    throw error;
  }
};

export const updateCosecha = async (id: string, data: Partial<Cosecha>): Promise<Cosecha> => {
  try {
    const response = await apiClient.patch(`/cosechas/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating cosecha:", error);
    throw error;
  }
};

export const deleteCosecha = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/cosechas/${id}`);
  } catch (error) {
    console.error("Error deleting cosecha:", error);
    throw error;
  }
};

export const closeHarvest = async (id: string): Promise<Cosecha> => {
  try {
    const response = await apiClient.post(`/cosechas/${id}/close`);
    return response.data;
  } catch (error) {
    console.error("Error closing harvest:", error);
    throw error;
  }
};

export const getCantidadDisponible = async (id: string): Promise<number> => {
  try {
    const response = await apiClient.get(`/cosechas/${id}/disponible`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cantidad disponible:", error);
    throw error;
  }
};

export const closeAllHarvestsByCultivo = async (cvzId: string): Promise<Cosecha[]> => {
  try {
    const response = await apiClient.post(`/cosechas/cultivo/${cvzId}/close-all`);
    return response.data;
  } catch (error) {
    console.error("Error closing all harvests by cultivo:", error);
    throw error;
  }
};

export const closeAllHarvestSalesByCultivo = async (cvzId: string): Promise<Cosecha[]> => {
  try {
    const response = await apiClient.post(`/cosechas/cultivo/${cvzId}/close-all-sales`);
    return response.data;
  } catch (error) {
    console.error("Error closing all harvest sales by cultivo:", error);
    throw error;
  }
};

// Object export for consistency
export const cosechasService = {
  createCosecha,
  getCosechas,
  getCosechasToday,
  getCosechasByCultivo,
  getCosechasAbiertasByCultivo,
  updateCosecha,
  deleteCosecha,
  closeHarvest,
  getCantidadDisponible,
  closeAllHarvestsByCultivo,
  closeAllHarvestSalesByCultivo,
};