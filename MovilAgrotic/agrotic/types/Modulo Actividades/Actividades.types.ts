

export interface ItemActividad {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string;
  estado?: string;
  imgUrl: string;
  fkCultivoVariedadZonaId: string;
  cultivoVariedadZona?: {
    id: string;
    zona?: {
      nombre: string;
    };
    cultivoXVariedad?: {
      variedad?: {
        nombre: string;
      };
    };
  };
}

export interface Actividad {
  id: string;
  descripcion: string;
  fechaAsignacion: string;
  horasDedicadas?: number;
  precioHora?: number;
  observacion: string;
  estado: boolean;
  fkCultivoVariedadZonaId?: string | null; // Allow null for independent activities
  fkCategoriaActividadId?: string;
  imgUrl?: string;
  dniResponsable?: number;
  tipo?: string;
  categoria?: string; // Campo adicional que viene del backend
  categoriaActividad?: {
    nombre: string;
  };
  cultivoVariedadZona?: {
   id: string;
   zona: {
     id: string;
     nombre: string;
   };
   cultivoXVariedad: {
     id: string;
     cultivo: {
       nombre: string;
       ficha: {
         numero: string;
       };
     };
     variedad: {
       nombre: string;
       tipoCultivo: {
         nombre: string;
       };
     };
   };
 };
  usuariosAsignados?: { usuario: { dni: number; nombres: string; apellidos: string; ficha?: { numero: number } }; activo: boolean }[];
  reservas?: Reservation[];
  inventarioUtilizado?: any[]; // Campo adicional que viene del backend
  nombreResponsable?: string; // Campo adicional que viene del backend
  zona?: string; // Campo adicional que viene del backend
}

export interface CreateActividadData {
  descripcion: string;
  fechaAsignacion: string;
  horasDedicadas?: number;
  observacion?: string;
  estado: boolean;
  fkCultivoVariedadZonaId: string | null; // Allow null for independent activities
  fkCategoriaActividadId: string;
  tipo?: string;
}

export interface UsuarioXActividad {
  fkUsuarioId: string;
  fkActividadId: string;
  fechaAsignacion: Date;
}

export interface InventarioXActividad {
  fkInventarioId: string;
  fkActividadId: string;
  cantidadUsada: number;
}

export interface Movimiento {
  fkInventarioId: string;
  stockReservado?: number;
  stockDevuelto?: number;
  stockDevueltoSobrante?: number;
  stockReservadoSobrante?: number;
}

export interface Reservation {
  id: string;
  fkActividadId: string;
  fkLoteId: string;
  fkEstadoId: number;
  cantidadReservada: number;
  cantidadUsada?: number;
  cantidadDevuelta?: number;
  actividad?: Actividad;
  lote?: any; // LotesInventario
  estado?: any; // EstadoReserva
}

export interface CreateReservationData {
  loteId: string;
  cantidadReservada: number;
  estadoId?: number;
}

export interface CreateReservationByProductData {
  productId: string;
  cantidadReservada: number;
  estadoId?: number;
}

export interface ConfirmUsageData {
  cantidadUsada: number;
}