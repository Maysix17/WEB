import apiClient from '../lib/axios/axios';

export interface Category {
  id: string;
  nombre: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const categorySearchService = {
  search: async (query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get(`/categoria-actividad/search/${query}?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default categorySearchService;