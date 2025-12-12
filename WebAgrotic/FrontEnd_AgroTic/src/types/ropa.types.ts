export interface RopaData {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}