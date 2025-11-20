import apiClient from "../lib/axios/axios";

export interface SensorSearchResponse {
  results: Array<{
    cultivoId: string;
    cultivoNombre: string;
    variedadNombre: string;
    tipoCultivoNombre: string;
    zonaId: string;
    zonaNombre: string;
    cvzId: string;
    sensorConfig: {
      id: string;
      nombre: string;
      host: string;
      port: number;
      protocol: string;
      topicBase: string;
    };
    uniqueSensorData: Array<{
      key: string;
      unidad: string;
      valor: number;
      fechaMedicion: string;
    }>;
  }>;
}

export interface ReportDataRequest {
  med_keys: string[];
  cultivo_ids?: string[];
  zona_ids?: string[];
  start_date?: string;
  end_date?: string;
  group_by?: 'hourly' | 'daily' | 'weekly';
}

export interface ReportDataResponse {
  cultivoId: string;
  cultivoNombre: string;
  variedadNombre: string;
  zonaId: string;
  zonaNombre: string;
  cvzId: string;
  period: string;
  statistics: Array<{
    med_key: string;
    count: number;
    min: number;
    max: number;
    avg: number;
    sum: number;
    stddev: number;
  }>;
}

export interface CultivosZonasResponse {
  cultivoId: string;
  cultivoNombre: string;
  variedadNombre: string;
  tipoCultivoNombre: string;
  zonaId: string;
  zonaNombre: string;
  cvzId: string;
  estadoCultivo: number;
  fechaSiembra: string;
}

export interface HistoricalSensorDataRequest {
  sensorKeys: string[];
}

export interface HistoricalSensorDataResponse {
  dataPoints: Array<{
    timestamp: string;
    sensorKey: string;
    value: number;
    unidad: string;
    cultivoNombre: string;
    zonaNombre: string;
    variedadNombre: string;
  }>;
  averages: Array<{
    sensorKey: string;
    average: number;
    count: number;
    unidad: string;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export const sensorService = {
  // Get sensor search data for comprehensive sensor information
  async getSensorSearchData(): Promise<SensorSearchResponse> {
    const response = await apiClient.get('/medicion-sensor/sensor-search');
    return response.data;
  },

  // Get available crop-zone combinations with sensor data
  async getCultivosZonas(): Promise<CultivosZonasResponse[]> {
    const response = await apiClient.get('/medicion-sensor/by-cultivos-zonas');
    return response.data;
  },

  // Get report data for PDF generation
  async getReportData(request: ReportDataRequest): Promise<ReportDataResponse[]> {
    const response = await apiClient.post('/medicion-sensor/report-data', request);
    return response.data;
  },

  // Get historical sensor data for chart generation
  async getHistoricalSensorData(request: HistoricalSensorDataRequest): Promise<HistoricalSensorDataResponse> {
    const response = await apiClient.post('/medicion-sensor/historical-data', request);
    return response.data;
  },

  // Get all sensor measurements
  async getAll(): Promise<any[]> {
    const response = await apiClient.get('/medicion-sensor');
    return response.data;
  },

  // Get sensor measurements by zone
  async getByZona(zonaId: string, limit?: number): Promise<any[]> {
    const response = await apiClient.get(`/medicion-sensor/zona/${zonaId}${limit ? `?limit=${limit}` : ''}`);
    return response.data;
  },

  // Get sensor measurements by MQTT config
  async getByMqttConfig(mqttConfigId: string): Promise<any[]> {
    const response = await apiClient.get(`/medicion-sensor/mqtt-config/${mqttConfigId}`);
    return response.data;
  },

  // Create new sensor measurement
  async create(data: any): Promise<any> {
    const response = await apiClient.post('/medicion-sensor', data);
    return response.data;
  },

  // Create batch sensor measurements
  async createBatch(data: any[]): Promise<any[]> {
    const response = await apiClient.post('/medicion-sensor/batch', data);
    return response.data;
  },

  // Update sensor measurement
  async update(id: string, data: any): Promise<any> {
    const response = await apiClient.patch(`/medicion-sensor/${id}`, data);
    return response.data;
  },

  // Delete sensor measurement
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/medicion-sensor/${id}`);
  },

  // Get single sensor measurement
  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/medicion-sensor/${id}`);
    return response.data;
  }
};