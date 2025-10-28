export interface Venta {
   id: string;
   cantidad: number;
   fecha: string;
   fkCosechaId: string;
   precioKilo?: number;
 }

export interface CreateVentaDto {
    cantidad: number;
    fecha?: string;
    fkCosechaId: string;
    unidadMedida: string;
    precioUnitario: number;
    precioKilo?: number;
    multipleHarvests?: Array<{
      id: string;
      cantidad: number;
    }>;
  }