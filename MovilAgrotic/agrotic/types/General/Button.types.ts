import type { ReactNode } from 'react';

export interface ButtonProps {
  /** Texto que se mostrará en el botón (para compatibilidad con CustomButton) */
  label?: string;

  /** Texto alternativo (para compatibilidad con PrimaryButton) */
  text?: string;

  /** Contenido del botón (para compatibilidad con ButtonAccion y otros) */
  children?: ReactNode;

  /** Función que se ejecuta cuando se hace clic en el botón */
  onClick?: () => void;

  /** Si el botón está deshabilitado */
  disabled?: boolean;

  /** Color del botón */
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | string;

  /** Variante del botón */
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "ghost" | "shadow";

  /** Tipo de botón (submit, reset, button) */
  type?: "button" | "submit" | "reset";

  /** Clases CSS adicionales (no usado en RN) */
  className?: string;

  /** Etiqueta aria para accesibilidad */
  ariaLabel?: string;

  /** Tamaño del botón */
  size?: "sm" | "md" | "lg";
}