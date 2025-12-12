import apiClient from "@/services/General/axios/axios";

export const categoriaService = {
  async getAll() {
    const response = await apiClient.get('/categoria-actividad');
    console.log('Categorias response:', response.data);
    return response.data || [];
  },
};

export const getCategorias = async () => {
  const response = await apiClient.get('/categoria');
  return response.data || [];
};

export const registerCategoria = async (data: { nombre: string; descripcion?: string; esDivisible: boolean }) => {
  const response = await apiClient.post('/categoria', data);
  return response.data;
};

export const updateCategoria = async (id: string, data: { nombre: string; descripcion?: string; esDivisible: boolean }) => {
  const response = await apiClient.put(`/categoria/${id}`, data);
  return response.data;
};

export const deleteCategoria = async (id: string) => {
  const response = await apiClient.delete(`/categoria/${id}`);
  return response.data;
};

export default categoriaService;