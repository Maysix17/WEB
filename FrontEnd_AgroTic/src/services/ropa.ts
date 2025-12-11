import apiClient from '../lib/axios/axios';
import type { RopaData, ApiResponse } from "../types/ropa.types";

// CREATE
export const registerRopa = async (
  ropaData: RopaData
): Promise<ApiResponse> => {
  const response = await apiClient.post('/ropa', ropaData);
  return response.data;
};

// READ ALL
export const getRopas = async (): Promise<RopaData[]> => {
  const response = await apiClient.get('/ropa');
  return response.data;
};

// UPDATE
export const updateRopa = async (
  id: string,
  ropaData: RopaData
): Promise<ApiResponse> => {
  const response = await apiClient.patch(`/ropa/${id}`, ropaData);
  return response.data;
};

// DELETE
export const deleteRopa = async (id: string): Promise<void> => {
  await apiClient.delete(`/ropa/${id}`);
};