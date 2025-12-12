import type { ReactNode } from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  children?: ReactNode;
}