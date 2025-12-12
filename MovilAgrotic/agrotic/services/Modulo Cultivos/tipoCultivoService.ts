import apiClient from "@/services/General/axios/axios";
import type { TipoCultivoData, ApiResponse } from "@/types/Modulo Cultivos/TipoCultivo.types";
import { handleDeletionError } from "@/utils/errorHandling";

// CREATE
export const registerTipoCultivo = async (
  cultivoData: TipoCultivoData
): Promise<ApiResponse> => {
  const response = await apiClient.post('/tipo-cultivos', cultivoData);
  return response.data;
};

// READ ALL
export const getTipoCultivos = async (): Promise<TipoCultivoData[]> => {
  const response = await apiClient.get('/tipo-cultivos');
  return response.data;
};

// UPDATE
export const updateTipoCultivo = async (
  id: string,
  cultivoData: TipoCultivoData
): Promise<ApiResponse> => {
  const response = await apiClient.patch(`/tipo-cultivos/${id}`, cultivoData);
  return response.data;
};

// DELETE
export const deleteTipoCultivo = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/tipo-cultivos/${id}`);
  } catch (error: any) {
    // Enhance the error with a more user-friendly message
    const friendlyMessage = handleDeletionError(error, 'tipo de cultivo');
    const enhancedError = new Error(friendlyMessage);
    enhancedError.cause = error;
    throw enhancedError;
  }
};