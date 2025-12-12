// /types/Usuarios.types.ts
// Tipos para el servicio de búsqueda de usuarios

export interface Usuario {
  id: string;
  numero_documento: string;
  dni: number;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  telefono: string;
  id_ficha: string;
  rol: string;
}

export interface RespuestaPaginada<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}