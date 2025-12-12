import apiClient from '../lib/axios/axios';
import type { Venta } from '../types/venta.types';

export const createVenta = async (data: Omit<Venta, 'id'>): Promise<Venta> => {
  const response = await apiClient.post('/venta', data);
  return response.data;
};

export const getVentas = async (): Promise<Venta[]> => {
  const response = await apiClient.get('/venta');
  return response.data;
};

export const updateVenta = async (id: string, data: Partial<Venta>): Promise<Venta> => {
  const response = await apiClient.patch(`/venta/${id}`, data);
  return response.data;
};

export const deleteVenta = async (id: string): Promise<void> => {
  await apiClient.delete(`/venta/${id}`);
};