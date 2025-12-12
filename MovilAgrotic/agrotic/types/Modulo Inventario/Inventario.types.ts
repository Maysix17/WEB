// /types/Inventario.types.ts
// Tipos para el servicio de inventario

export interface Categoria {
  id: string;
  nombre: string;
  esDivisible?: boolean;
}

export interface Bodega {
  id: string;
  nombre: string;
  numero?: string;
}

export interface ItemInventario {
  id: string;
  nombre: string;
  descripcion?: string;
  stock: number;
  precio: number;
  capacidadUnidad?: number;
  fechaVencimiento?: string;
  imgUrl: string;
  fkCategoriaId?: string;
  fkBodegaId?: string;
  stock_disponible?: number;
  stock_sobrante?: number;
  categoria?: {
    id: string;
    nombre: string;
    tipoUnidad?: {
      simbolo: string;
    };
  };
  bodega?: {
    id: string;
    nombre: string;
    numero: string;
  };
  movimientos?: any[];
}

export interface LoteInventario {
  id: string;
  fkProductoId: string;
  fkBodegaId: string;
  cantidadDisponible: string;
  cantidadParcial: string;
  fechaIngreso: string;
  fechaVencimiento?: string;
  esParcial: boolean;
  stock?: number;
  stockTotal?: number;
  cantidadDisponibleParaReservar?: number;
  cantidadReservada?: number;
  unidadAbreviatura?: string;
  producto: {
    id: string;
    nombre: string;
    descripcion?: string;
    sku: string;
    precioCompra: string;
    precioVenta: string;
    imgUrl?: string;
    capacidadPresentacion?: number;
    vidaUtilPromedioPorUsos?: number;
    categoria?: {
      id: string;
      nombre: string;
    };
    unidadMedida?: {
      id: string;
      nombre: string;
      abreviatura: string;
    };
  };
  bodega: {
    id: string;
    nombre: string;
    numero?: string;
  };
}

export interface RespuestaInventario {
  items: ItemInventario[];
  total: number;
}