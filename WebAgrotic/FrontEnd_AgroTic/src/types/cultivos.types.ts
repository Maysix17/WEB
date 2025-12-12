export interface Cultivo {
  cvzid: string; // CVZ ID - fundamental para cosechas
  id: string;
  ficha: string;
  lote: string; // CORREGIDO: Propiedades en minúsculas para coincidir con el backend (getRawMany)
  nombrecultivo: string;
  fechasiembra: string;
  fechacosecha: string;
  estado: number; // Estado del cultivo: 1=En curso, 0=Finalizado
  cosechaid?: string; // ID de la cosecha para ventas

  // NUEVOS CAMPOS PARA CARACTERÍSTICAS DEL CULTIVO
  cantidad_plantas_inicial?: number;
  cantidad_plantas_actual?: number;
  fk_estado_fenologico?: number;
  estado_fenologico?: EstadoFenologico;
  estado_fenologico_nombre?: string; // Nombre del estado fenológico desde la query
  estado_fenologico_descripcion?: string; // Descripción del estado fenológico desde la query
  fecha_actualizacion?: string;
  edad_dias?: number; // Calculado en frontend
  area_terreno?: number; // De zona
  rendimiento_promedio?: number; // Calculado de cosechas

  // Información del tipo de cultivo
  tipoCultivo?: {
    nombre: string;
    esPerenne: boolean;
  };
}

export interface SearchCultivoDto {
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


export interface EstadoFenologico {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

export interface UpdateCantidadPlantasDto {
  cantidad_plantas: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
