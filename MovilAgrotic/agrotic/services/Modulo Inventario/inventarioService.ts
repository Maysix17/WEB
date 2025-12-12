import apiClient from "@/services/General/axios/axios";
import type { ItemInventario, RespuestaInventario, Categoria, Bodega, LoteInventario } from "@/types/Modulo Inventario/Inventario.types";

export const inventarioService = {
  getAll: async (page: number = 1, limit: number = 10): Promise<{ items: LoteInventario[], total: number }> => {
    try {
      const response = await apiClient.get(`/inventario?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
  },

  search: async (query: string, page: number = 1, limit: number = 10): Promise<{ items: LoteInventario[], total: number }> => {
    try {
      const response = await apiClient.get(`/inventario/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error searching inventory:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<ItemInventario> => {
    try {
      const response = await apiClient.get(`/inventario/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      throw error;
    }
  },

  create: async (data: FormData): Promise<ItemInventario> => {
    try {
      const response = await apiClient.post("/inventario", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating inventory item:", error);
      throw error;
    }
  },

  update: async (id: string, data: FormData): Promise<ItemInventario> => {
    try {
      const response = await apiClient.put(`/inventario/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/inventario/${id}`);
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
    }
  },

  getCategorias: async (): Promise<Categoria[]> => {
    try {
      const response = await apiClient.get('/categoria');
      return response.data;
    } catch (error) {
      console.error('Error fetching categorias:', error);
      throw error;
    }
  },

  getBodegas: async (): Promise<Bodega[]> => {
    try {
      const response = await apiClient.get('/bodega');
      return response.data;
    } catch (error) {
      console.error('Error fetching bodegas:', error);
      throw error;
    }
  },

  getUnidadesMedida: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/unidades-medida');
      return response.data;
    } catch (error) {
      console.error('Error fetching unidades medida:', error);
      throw error;
    }
  },

  getProductos: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/productos');
      return response.data;
    } catch (error) {
      console.error('Error fetching productos:', error);
      throw error;
    }
  },

  createProduct: async (data: any): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      formData.append('precioCompra', data.precioCompra.toString());
      formData.append('precioVenta', data.precioVenta.toString());
      if (data.sku) formData.append('sku', data.sku);
      formData.append('fkCategoriaId', data.fkCategoriaId);
      if (data.fkUnidadMedidaId) formData.append('fkUnidadMedidaId', data.fkUnidadMedidaId);
      if (data.capacidadPresentacion) formData.append('capacidadPresentacion', data.capacidadPresentacion.toString());

      const response = await apiClient.post('/productos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  createWarehouse: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/bodega', data);
      return response.data;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  },

  createLote: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/inventario', data);
      return response.data;
    } catch (error) {
      console.error('Error creating lote:', error);
      throw error;
    }
  },

  updateLote: async (id: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.put(`/inventario/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating lote:', error);
      throw error;
    }
  },
};