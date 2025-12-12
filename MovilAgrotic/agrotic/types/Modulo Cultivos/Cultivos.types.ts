// /types/Cultivos.types.ts
// Tipos para el servicio de cultivos

export interface TipoCultivo {
  nombre: string;
  esPerenne: boolean;
}

export interface ItemCultivo {
  cvzid: string; // CVZ ID - fundamental para cosechas
  id: string;
  ficha: string;
  lote: string;
  nombrecultivo: string;
  fechasiembra: string;
  fechacosecha: string;
  estado: number; // Estado del cultivo: 1=En curso, 0=Finalizado
  cosechaid?: string; // ID de la cosecha para ventas
  numCosechas?: number;
  tipoCultivo?: TipoCultivo;
  tipo_cultivo_nombre?: string;
  tipo_cultivo_es_perenne?: boolean;
  cantidad_plantas_inicial?: number;
  cantidad_plantas_actual?: number;
  estado_fenologico?: string;
  estado_fenologico_nombre?: string;
  area_terreno?: number;
  rendimiento_promedio?: number;
}

export interface FiltrosBusquedaCultivo {
  buscar?: string; // Buscar por zona
  buscar_cultivo?: string; // Buscar por variedad o tipo de cultivo
  fecha_inicio?: string; // Fecha inicio del rango
  fecha_fin?: string; // Fecha fin del rango
  id_titulado?: string; // Número de ficha del titulado
  estado_cultivo?: number; // Estado: 1=activo, 0=inactivo
}

export interface CreateCultivoData {
  tipoCultivoId: string;
  variedadId: string;
  zonaId: string;
  cantidad_plantas_inicial?: number;
}

export interface UpdateCantidadPlantasDto {
  cantidad_plantas_actual: number;
}

export interface EstadoFenologico {
  id: number;
  nombre: string;
  descripcion?: string;
  orden?: number;
}