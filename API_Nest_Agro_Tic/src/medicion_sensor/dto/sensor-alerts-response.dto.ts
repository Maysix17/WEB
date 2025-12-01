export interface SensorAlertDto {
  fechaMedicion: string;
  sensor: string;
  valorMedido: number;
  umbralSobrepasado: 'máximo' | 'mínimo';
  descripcion: string;
  zonaNombre: string;
  cultivoNombre: string;
  variedadNombre: string;
}

export interface SensorAlertsResponseDto {
  alerts: SensorAlertDto[];
  totalAlerts: number;
}
