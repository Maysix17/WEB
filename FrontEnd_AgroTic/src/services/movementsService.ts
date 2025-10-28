import apiClient from '../lib/axios/axios';
import type { MovimientoInventario, MovimientosFilters } from '../types/movements.types';

export const movementsService = {
  getAll: async (): Promise<MovimientoInventario[]> => {
    const response = await apiClient.get('/movimientos-inventario');
    return response.data;
  },

  getFiltered: async (filters: MovimientosFilters): Promise<MovimientoInventario[]> => {
    const params = new URLSearchParams();

    if (filters.startDate) {
      params.append('startDate', filters.startDate.toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate.toISOString().split('T')[0]);
    }
    if (filters.productQuery) {
      params.append('productQuery', filters.productQuery);
    }

    const response = await apiClient.get(`/movimientos-inventario/filter?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string): Promise<MovimientoInventario> => {
    const response = await apiClient.get(`/movimientos-inventario/${id}`);
    return response.data;
  },
};