import apiClient from "@/services/General/axios/axios";

export interface Zona {
  id: string;
  nombre: string;
  coordenadas: any;
  areaMetrosCuadrados?: number;
  tipoLote?: string;
  coorX?: number;
  coorY?: number;
  fkMapaId?: string;
  mqttConfig?: MqttConfig;
  zonaMqttConfigs?: ZonaMqttConfig[];
}

export interface MqttConfig {
  id: string;
  nombre: string;
  host: string;
  port: number;
  protocol: string;
  topicBase: string;
  activa: boolean;
  zonaMqttConfigs?: ZonaMqttConfig[];
}

export interface ZonaMqttConfig {
  id: string;
  fkMqttConfigId: string;
  fkZonaId: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
  mqttConfig?: MqttConfig;
  zona?: Zona;
}

export interface MedicionSensor {
  id: string;
  key: string;
  valor: number;
  unidad: string;
  fechaMedicion: string;
  fkMqttConfigId: string;
  fkZonaId: string;
}

export const zonaService = {
  async getAll(): Promise<Zona[]> {
    const response = await apiClient.get('/zonas');
    return response.data;
  },

  async getById(id: string): Promise<Zona> {
    const response = await apiClient.get(`/zonas/${id}`);
    return response.data;
  },

  async create(zonaData: {
    nombre: string;
    coordenadas: any;
    areaMetrosCuadrados?: number;
    fkMapaId?: string;
  }): Promise<Zona> {
    const response = await apiClient.post('/zonas', zonaData);
    return response.data;
  },

  async update(id: string, zonaData: {
    nombre?: string;
    coordenadas?: any;
    areaMetrosCuadrados?: number;
  }): Promise<Zona> {
    const response = await apiClient.patch(`/zonas/${id}`, zonaData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/zonas/${id}`);
  },
};

export const mqttConfigService = {
  async getAll(): Promise<MqttConfig[]> {
    const response = await apiClient.get('/mqtt-config');
    return response.data;
  },

  async getActive(): Promise<MqttConfig[]> {
    const response = await apiClient.get('/mqtt-config/active');
    return response.data;
  },

  async getByZona(zonaId: string): Promise<ZonaMqttConfig | null> {
    const response = await apiClient.get(`/mqtt-config/zona/${zonaId}`);
    return response.data;
  },

  async getZonaMqttConfigs(zonaId: string): Promise<ZonaMqttConfig[]> {
    const response = await apiClient.get(`/mqtt-config/zona/${zonaId}/configs`);
    return response.data;
  },

  async assignConfigToZona(zonaId: string, configId: string): Promise<{ success: boolean; data?: ZonaMqttConfig; error?: { configName: string; zonaName: string } }> {
    const response = await apiClient.post('/mqtt-config/assign', { zonaId, configId });
    return response.data;
  },

  async unassignConfigFromZona(zonaId: string, configId: string): Promise<void> {
    await apiClient.post('/mqtt-config/unassign', { zonaId, configId });
  },

  async create(config: Omit<MqttConfig, 'id' | 'zonaMqttConfigs'>): Promise<MqttConfig> {
    const response = await apiClient.post('/mqtt-config', config);
    return response.data;
  },

  async update(id: string, config: Partial<MqttConfig>): Promise<MqttConfig> {
    const response = await apiClient.patch(`/mqtt-config/${id}`, config);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/mqtt-config/${id}`);
  },
};

export const medicionSensorService = {
  async getByZona(zonaId: string, limit?: number): Promise<MedicionSensor[]> {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await apiClient.get(`/medicion-sensor/zona/${zonaId}`, { params });
    return response.data;
  },
};

export default zonaService;