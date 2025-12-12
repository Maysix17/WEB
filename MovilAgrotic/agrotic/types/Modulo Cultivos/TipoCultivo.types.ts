// /types/TipoCultivo.types.ts
// Tipos para el servicio de tipos de cultivo

export interface TipoCultivoData {
  id?: string;
  nombre: string;
  esPerenne: boolean;
}

export interface ApiResponse {
  message: string;
}