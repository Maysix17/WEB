// /types/Cosechas.types.ts
// Tipos para el servicio de cosechas

export interface Cosecha {
  id: string;
  cantidad: number;
  fecha: string;
  unidadMedida: string;
  fkCultivosVariedadXZonaId: string;
  cantidadDisponible: number;
  cerrado: boolean;
  precioUnitario?: number;
  cantidad_plantas_cosechadas?: number;
  rendimiento_por_planta?: number;
  cultivosVariedadXZona?: any; // Populated from API
}

export interface CreateCosechaDto {
  cantidad: number;
  fecha: string;
  unidadMedida: string;
  fkCultivosVariedadXZonaId: string;
  cantidad_plantas_cosechadas?: number;
  rendimiento_por_planta?: number;
}