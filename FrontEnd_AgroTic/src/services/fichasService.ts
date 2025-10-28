import apiClient from '../lib/axios/axios';

export interface Ficha {
  id: string;
  numero: number;
}

export const getFichas = async (): Promise<Ficha[]> => {
  const response = await apiClient.get('/fichas');
  return response.data;
};