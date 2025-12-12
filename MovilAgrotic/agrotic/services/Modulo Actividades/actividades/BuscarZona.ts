import apiClient from "@/services/General/axios/axios";

export interface Zone {
  id: string;
  nombre: string;
  zonaId?: string;
  cultivoId?: string;
  variedadNombre?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const zoneSearchService = {
  search: async (query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Zone>> => {
    const response = await apiClient.get(`/zonas/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default zoneSearchService;

