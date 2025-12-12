// Importaciones: cliente Axios configurado y tipos para movimientos de inventario
import apiClient from "@/services/General/axios/axios";
import type { MovimientoInventario, MovimientosFilters } from "@/types/Modulo Inventario/movements.types";

// Servicio para gestionar movimientos de inventario (entradas/salidas de productos)
export const movimientosService = {
  // Función para obtener todos los movimientos de inventario
  getAll: async (): Promise<MovimientoInventario[]> => {
    try {
      const response = await apiClient.get('/movimientos-inventario');
      return response.data;
    } catch (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }
  },

  // Función para obtener movimientos filtrados por fecha y producto
  getFiltered: async (filters: MovimientosFilters): Promise<MovimientoInventario[]> => {
    try {
      const params = new URLSearchParams();

      // Agrega parámetros de filtro si existen
      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString().split('T')[0]); // Convierte a formato YYYY-MM-DD
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString().split('T')[0]); // Convierte a formato YYYY-MM-DD
      }
      if (filters.productQuery) {
        params.append('productQuery', filters.productQuery); // Búsqueda por nombre de producto
      }

      const response = await apiClient.get(`/movimientos-inventario/filter?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering movements:', error);
      throw error;
    }
  },

  // Función para obtener un movimiento específico por ID
  getOne: async (id: string): Promise<MovimientoInventario> => {
    try {
      const response = await apiClient.get(`/movimientos-inventario/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movement:', error);
      throw error;
    }
  },
};