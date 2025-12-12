import apiClient from "@/services/General/axios/axios";
import type { ItemCultivo, FiltrosBusquedaCultivo } from "@/types/Modulo Cultivos/Cultivos.types";

export const cultivosService = {
  create: async (data: any): Promise<ItemCultivo> => {
    try {
      const siembraDate = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T12:00:00Z`;
      })();
      console.log('Fecha de siembra a enviar:', siembraDate);
      const payload: any = {
        tipoCultivoId: data.tipoCultivoId,
        variedadId: data.variedadId,
        zonaId: data.zonaId,
        estado: 1, // Default to active
        siembra: siembraDate,
      };
      if (data.cantidad_plantas_inicial !== undefined) {
        payload.cantidad_plantas_inicial = data.cantidad_plantas_inicial;
      }
      console.log(' FRONTEND - Creando cultivo con datos:', data);
      console.log(' FRONTEND - Payload enviado al backend:', payload);
      const response = await apiClient.post("/cultivos", payload);
      console.log(' FRONTEND - Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating cultivo:", error);
      throw error;
    }
  },

  getAll: async (): Promise<ItemCultivo[]> => {
    try {
      const response = await apiClient.get("/cultivos");
      // Map backend response to nest tipoCultivo object
      return response.data.map((item: any) => ({
        ...item,
        tipoCultivo: {
          nombre: item.tipo_cultivo_nombre,
          esPerenne: item.tipo_cultivo_es_perenne,
        },
      }));
    } catch (error) {
      console.error("Error fetching cultivos:", error);
      throw error;
    }
  },

  search: async (filters: FiltrosBusquedaCultivo): Promise<ItemCultivo[]> => {
    try {
      const response = await apiClient.post("/cultivos/search", filters);
      // Map backend response to nest tipoCultivo object
      return response.data.map((item: any) => ({
        ...item,
        tipoCultivo: {
          nombre: item.tipo_cultivo_nombre,
          esPerenne: item.tipo_cultivo_es_perenne,
        },
      }));
    } catch (error) {
      console.error("Error searching cultivos:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<ItemCultivo> => {
    try {
      const response = await apiClient.get(`/cultivos/${id}`);
      // Map backend response to nest tipoCultivo object
      const item = response.data;
      return {
        ...item,
        tipoCultivo: {
          nombre: item.tipo_cultivo_nombre,
          esPerenne: item.tipo_cultivo_es_perenne,
        },
      };
    } catch (error) {
      console.error("Error fetching cultivo by id:", error);
      throw error;
    }
  },

  getActividadesByCultivo: async (cvzId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/actividades/by-cultivo-variedad-zona/${cvzId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching actividades by cultivo:", error);
      throw error;
    }
  },

  getCosechasByCultivo: async (cvzId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/cosechas/cultivo/${cvzId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cosechas by cultivo:", error);
      throw error;
    }
  },

  getVentasByCultivo: async (cvzId: string): Promise<any[]> => {
    try {
      // Get all ventas and filter by cosechas of this cultivo
      const [cosechas, allVentas] = await Promise.all([
        apiClient.get(`/cosechas/cultivo/${cvzId}`),
        apiClient.get('/venta')
      ]);

      const cosechaIds = cosechas.data.map((c: any) => c.id);
      const cultivoVentas = allVentas.data.filter((venta: any) =>
        cosechaIds.includes(venta.fkCosechaId)
      );

      return cultivoVentas;
    } catch (error) {
      console.error("Error fetching ventas by cultivo:", error);
      throw error;
    }
  },

  calcularEdadCultivo: (fechaSiembra: string): number => {
    const siembra = new Date(fechaSiembra);
    const hoy = new Date();
    return Math.floor((hoy.getTime() - siembra.getTime()) / (1000 * 60 * 60 * 24));
  },

  finalizeCultivo: async (id: string): Promise<ItemCultivo> => {
    try {
      const response = await apiClient.patch(`/cultivos/${id}/finalize`, { estado: 0 });
      return response.data;
    } catch (error) {
      console.error("Error finalizing cultivo:", error);
      throw error;
    }
  },

  getCultivosVariedadXZonaByCultivo: async (cultivoId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/cultivos-variedad-x-zona/cultivo/${cultivoId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cultivos-variedad-zona by cultivo:", error);
      throw error;
    }
  },

  getZonaCultivosVariedadXZona: async (zonaId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/zonas/${zonaId}/cultivos-variedad-zona`);
      return response.data.cultivos || [];
    } catch (error) {
      console.error("Error fetching zona cultivos-variedad-zona:", error);
      throw error;
    }
  },

  getZonaByNombre: async (nombre: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/zonas?nombre=${encodeURIComponent(nombre)}`);
      const zonas = response.data;
      const zona = zonas.find((z: any) => z.nombre === nombre);
      if (!zona) {
        throw new Error(`Zona con nombre ${nombre} no encontrada`);
      }
      return zona;
    } catch (error) {
      console.error("Error fetching zona by nombre:", error);
      throw error;
    }
  },
};