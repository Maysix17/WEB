import apiClient from '../lib/axios/axios';
import type { TipoCultivoData, ApiResponse } from "../types/tipoCultivo.types";

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
  await apiClient.delete(`/tipo-cultivos/${id}`);
};
