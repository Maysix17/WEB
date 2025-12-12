import apiClient from '../lib/axios/axios';
import type { BodegaData, ApiResponse } from "../types/bodega.types";

// CREATE
export const registerBodega = async (
  bodegaData: BodegaData
): Promise<ApiResponse> => {
  const response = await apiClient.post('/bodega', bodegaData);
  return response.data;
};

// READ ALL
export const getBodegas = async (): Promise<BodegaData[]> => {
  const response = await apiClient.get('/bodega');
  return response.data;
};

// UPDATE
export const updateBodega = async (
  id: string,
  bodegaData: BodegaData
): Promise<ApiResponse> => {
  const response = await apiClient.patch(`/bodega/${id}`, bodegaData);
  return response.data;
};

// DELETE
export const deleteBodega = async (id: string): Promise<void> => {
  await apiClient.delete(`/bodega/${id}`);
};