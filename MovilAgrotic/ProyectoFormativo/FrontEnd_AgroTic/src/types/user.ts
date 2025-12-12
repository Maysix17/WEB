/**
 * Interface for the Permission type.
 */
export interface Permission {
  id: string;
  accion: string;
}

/**
 * Interface for the Role type.
 */
export interface Role {
  id: string;
  nombre: string;
  permisos: Permission[];
}

/**
 * Interface for the Ficha type.
 */
export interface Ficha {
  id: string;
  numero: number;
}

/**
 * Interface for the User type.
 */
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string;
  rol: Role;
  ficha?: Ficha;
}