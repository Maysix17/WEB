export interface TipoCultivoData {
  id?: string;
  nombre: string;
  esPerenne?: boolean;
}
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}