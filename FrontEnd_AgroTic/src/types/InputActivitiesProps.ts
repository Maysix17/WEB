import type { InputProps } from "@heroui/react";

export interface InputActivitiesProps extends Omit<InputProps, 'placeholder' | 'value' | 'onChange' | 'startContent'> {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startContent?: React.ReactNode;
}