// /types/Venta.types.ts
// Tipos para el servicio de ventas

export interface Venta {
  id: string;
  cantidad: number;
  fecha: string;
  unidadMedida: string;
  precioUnitario: number;
  fkCosechaId: string;
  multipleHarvests?: Array<{ id: string; cantidad: number }>;
}