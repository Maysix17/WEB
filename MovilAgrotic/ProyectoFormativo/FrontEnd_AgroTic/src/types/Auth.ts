export interface RegisterPayload {
  dni: number;
  nombres: string;
  apellidos: string;
  correo: string;
  password: string;
  telefono: number;
}

export interface RegisterFormData {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  dni: number;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface Permission {
  modulo: string;
  recurso: string;
  accion: string;
}

export interface DecodedToken {
  sub: string;
  dni: string;
  rol: string;
  permisos: Permission[];
  iat: number;
  exp: number;
}
