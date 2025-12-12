import type { ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
  variant?: 'body' | 'caption' | 'muted';
}