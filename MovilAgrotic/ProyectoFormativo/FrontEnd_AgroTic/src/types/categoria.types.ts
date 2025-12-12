export interface CategoriaData {
  id?: string;
  nombre: string;
  descripcion?: string;
  esDivisible: boolean;
}

export interface ApiResponse {
  message: string;
  data?: any;
}