// Tipos para mediciones de sensores IoT

export interface MedicionSensor {
  id?: string;
  key: string;
  valor: number;
  unidad: string;
  fechaMedicion: string;
  fkZonaMqttConfigId: string;
  fkZonaId?: string;
}

export interface LecturaNueva {
  zonaId: string;
  mediciones: MedicionSensor[];
  timestamp: string;
}

export interface EstadoMqtt {
  zonaId: string;
  conectado: boolean;
  mensaje?: string;
}