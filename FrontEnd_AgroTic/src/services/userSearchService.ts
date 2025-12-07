import apiClient from '../lib/axios/axios';

export interface User {
  id: string;
  dni: number;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  telefono: number;
  id_ficha: string;
  rol: string;
  rolId?: string;
  fichaId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const userSearchService = {
  search: async (query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get(`/usuarios/search/${query}?page=${page}&limit=${limit}`);
    return response.data;
  },
  searchByDni: async (dni: string): Promise<User[]> => {
    const response = await apiClient.get(`/usuarios/search/dni/${dni}`);
    // The backend returns a single user object, not an array
    return Array.isArray(response.data) ? response.data : [response.data];
  },
};

export default userSearchService;