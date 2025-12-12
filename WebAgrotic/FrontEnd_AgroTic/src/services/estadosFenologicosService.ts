import api from '../lib/axios/axios';
import type { EstadoFenologico } from '../types/cultivos.types';

export const getEstadosFenologicos = async (): Promise<EstadoFenologico[]> => {
  const response = await api.get('/estados-fenologicos');
  return response.data;
};

export const createEstadoFenologico = async (data: Omit<EstadoFenologico, 'id'>): Promise<EstadoFenologico> => {
  const response = await api.post('/estados-fenologicos', data);
  return response.data;
};

export const updateEstadoFenologico = async (id: number, data: Partial<EstadoFenologico>): Promise<EstadoFenologico> => {
  const response = await api.patch(`/estados-fenologicos/${id}`, data);
  return response.data;
};

export const deleteEstadoFenologico = async (id: number): Promise<void> => {
  await api.delete(`/estados-fenologicos/${id}`);
};