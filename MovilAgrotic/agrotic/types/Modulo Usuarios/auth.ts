// Tipos para autenticación de usuario
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

// Respuesta de autenticación con tokens
export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user?: User;
  message?: string;
}

// Información del usuario
export interface User {
  id: string;
  name: string;
  email: string;
  dni: number;
  nombres: string;
  apellidos: string;
  telefono: number;
  rol?: string;
  // Add other user properties as needed
}

// Permisos del usuario
export interface Permission {
  modulo: string;
  recurso: string;
  accion: string;
}

// Token decodificado
export interface DecodedToken {
  sub: string;
  dni: string;
  rol: string;
  permisos: Permission[];
  iat: number;
  exp: number;
}

// Estado de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Configuración de autenticación
export interface AuthConfig {
  refreshTokenEndpoint: string;
  verifyTokenEndpoint: string;
  loginEndpoint: string;
  logoutEndpoint: string;
  registerEndpoint: string;
}