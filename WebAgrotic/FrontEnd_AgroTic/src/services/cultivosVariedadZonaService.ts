import api from '../lib/axios/axios';
import type { UpdateCantidadPlantasDto } from '../types/cultivos.types';

export const actualizarCantidadPlantas = async (id: string, data: UpdateCantidadPlantasDto) => {
  const response = await api.post(`/cultivos-variedad-x-zona/${id}/cantidad-plantas`, data);
  return response.data;
};

export const actualizarEstadoFenologico = async (id: string, estadoId: number) => {
  const response = await api.put(`/cultivos-variedad-x-zona/${id}/estado-fenologico`, {
    fk_estado_fenologico: estadoId
  });
  return response.data;
};

export const calcularEdadCultivo = (fechaSiembra: string): number => {
  const siembra = new Date(fechaSiembra);
  const hoy = new Date();
  return Math.floor((hoy.getTime() - siembra.getTime()) / (1000 * 60 * 60 * 24));
};