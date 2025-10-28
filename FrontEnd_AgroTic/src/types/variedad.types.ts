export interface VariedadData {
  id?: string;
  nombre: string;
  fkTipoCultivoId?: string; // ID del tipo de cultivo asociado
  tipoCultivo?: { nombre: string }; // Objeto para mostrar el nombre en la tabla
}

export interface ApiResponse {
  message: string;
}