import apiClient from '../lib/axios/axios';
import type { VariedadData, ApiResponse } from "../types/variedad.types";

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
  await apiClient.delete(`/variedades/${id}`);
};