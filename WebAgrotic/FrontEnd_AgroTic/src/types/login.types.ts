// Props para el formulario de login
export interface LoginFormProps {
  onLogin: (payload: { dni: number; password: string }) => void;
}

// Props para la tarjeta de login
export interface LoginCardProps {
  onLogin: (payload: { dni: number; password: string }) => void;
}