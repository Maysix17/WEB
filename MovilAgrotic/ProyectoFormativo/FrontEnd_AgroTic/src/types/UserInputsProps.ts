// src/interfaces/UserInputsProps.ts
export interface UserInputsProps {
  dni?: string;
  setDni?: (value: string) => void;

  password?: string;
  setPassword?: (value: string) => void;

  confirmPassword?: string;
  setConfirmPassword?: (value: string) => void;

  email?: string;
  setEmail?: (value: string) => void;

  nombres?: string;
  setNombres?: (value: string) => void;

  apellidos?: string;
  setApellidos?: (value: string) => void;

  telefono?: string;
  setTelefono?: (value: string) => void;
}
