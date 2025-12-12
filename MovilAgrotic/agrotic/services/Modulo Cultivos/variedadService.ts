import apiClient from "@/services/General/axios/axios";
import type { VariedadData, ApiResponse } from "@/types/Modulo Cultivos/Variedad.types";
import { handleDeletionError } from "@/utils/errorHandling";

// CREATE
export const registerVariedad = async (
  variedadData: VariedadData
): Promise<ApiResponse> => {
  const response = await apiClient.post('/variedades', variedadData);
  return response.data;
};

// READ ALL
export const getVariedades = async (): Promise<VariedadData[]> => {
  const response = await apiClient.get('/variedades');
  return response.data;
};

// UPDATE
export const updateVariedad = async (
  id: string,
  variedadData: VariedadData
): Promise<ApiResponse> => {
  const response = await apiClient.patch(`/variedades/${id}`, variedadData);
  return response.data;
};

// DELETE
export const deleteVariedad = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/variedades/${id}`);
  } catch (error: any) {
    // Enhance the error with a more user-friendly message
    const friendlyMessage = handleDeletionError(error, 'variedad');
    const enhancedError = new Error(friendlyMessage);
    enhancedError.cause = error;
    throw enhancedError;
  }
};