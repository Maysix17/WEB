import apiClient from '../lib/axios/axios';

export interface Ficha {
  id: string;
  numero: number;
}

export interface CreateFichaData {
  numero: number;
}

export interface UpdateFichaData {
  numero: number;
}

export const getFichas = async (): Promise<Ficha[]> => {
  const response = await apiClient.get('/fichas');
  return response.data;
};

export const createFicha = async (data: CreateFichaData): Promise<Ficha> => {
  const response = await apiClient.post('/fichas', data);
  return response.data;
};

export const updateFicha = async (id: string, data: UpdateFichaData): Promise<Ficha> => {
  const response = await apiClient.put(`/fichas/${id}`, data);
  return response.data;
};

export const deleteFicha = async (id: string): Promise<void> => {
  await apiClient.delete(`/fichas/${id}`);
};