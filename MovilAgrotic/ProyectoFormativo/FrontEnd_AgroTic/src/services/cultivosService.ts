import type { Cultivo, SearchCultivoDto, CreateCultivoData } from "../types/cultivos.types";
import apiClient from '../lib/axios/axios';

export const searchCultivos = async (
  searchData: SearchCultivoDto
): Promise<Cultivo[]> => {
  const response = await apiClient.post('/cultivos/search', searchData);
  // Map backend response to nest tipoCultivo object
  return response.data.map((item: any) => ({
    ...item,
    tipoCultivo: {
      nombre: item.tipo_cultivo_nombre,
      esPerenne: item.tipo_cultivo_es_perenne,
    },
  }));
};

export const getAllCultivos = async (): Promise<Cultivo[]> => {
  const response = await apiClient.get('/cultivos');
  // Map backend response to nest tipoCultivo object
  return response.data.map((item: any) => ({
    ...item,
    tipoCultivo: {
      nombre: item.tipo_cultivo_nombre,
      esPerenne: item.tipo_cultivo_es_perenne,
    },
  }));
};

export const createCultivo = async (data: CreateCultivoData): Promise<Cultivo> => {
  console.log('🌱 FRONTEND - Creando cultivo con datos:', data);

  // Use the correct endpoint for creating cultivos
  const payload = {
    tipoCultivoId: data.tipoCultivoId,
    variedadId: data.variedadId,
    zonaId: data.zonaId,
    estado: 1, // Default to active
    siembra: new Date().toISOString(),
    cantidad_plantas_inicial: data.cantidad_plantas_inicial,
  };

  console.log('🌱 FRONTEND - Payload enviado al backend:', payload);

  const response = await apiClient.post('/cultivos', payload);
  console.log('🌱 FRONTEND - Respuesta del backend:', response.data);

  return response.data;
};

export const getCultivosVariedadXZonaByCultivo = async (cultivoId: string): Promise<any[]> => {
  const response = await apiClient.get(`/cultivos-variedad-x-zona/cultivo/${cultivoId}`);
  return response.data;
};

export const getZonaCultivosVariedadXZona = async (zonaId: string): Promise<any[]> => {
  const response = await apiClient.get(`/zonas/${zonaId}/cultivos-variedad-zona`);
  return response.data.cultivos || [];
};

export const getZonaByNombre = async (nombre: string): Promise<any> => {
  const response = await apiClient.get(`/zonas?nombre=${encodeURIComponent(nombre)}`);
  const zonas = response.data;
  const zona = zonas.find((z: any) => z.nombre === nombre);
  if (!zona) {
    throw new Error(`Zona con nombre ${nombre} no encontrada`);
  }
  return zona;
};

export const finalizeCultivo = async (id: string): Promise<Cultivo> => {
  const response = await apiClient.patch(`/cultivos/${id}/finalize`, { estado: 0 });
  return response.data;
};