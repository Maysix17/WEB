// /types/Variedad.types.ts
// Tipos para el servicio de variedades

export interface VariedadData {
  id?: string;
  nombre: string;
  fkTipoCultivoId: string;
  tipoCultivo?: {
    nombre: string;
    esPerenne: boolean;
  };
}

export interface ApiResponse {
  message: string;
}