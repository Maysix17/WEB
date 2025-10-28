import apiClient from '../lib/axios/axios';

export const zonaService = {
  async getAll() {
    const response = await apiClient.get('/zonas');
    return response.data;
  },

  async create(zonaData: {
    nombre: string;
    tipoLote: string;
    coorX: number;
    coorY: number;
    coordenadas?: any;
    fkMapaId?: string;
  }) {
    const response = await apiClient.post('/zonas', zonaData);
    return response.data;
  },
};

export default zonaService;