// /types/Sensores.types.ts
// Tipos para el servicio de sensores

export interface ItemSensor {
  id: string;
  nombre: string;
  coorX: number;
  coorY: number;
  rangoMinimo?: number;
  rangoMaximo?: number;
  img: string;
  estado: number;
  fechaInstalacion: string;
  fechaUltimoMantenimiento?: string;
  fkTipoSensorId: number;
  fkZonaId?: number;
  tipoSensor?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  zona?: {
    id: number;
    nombre: string;
  };
}