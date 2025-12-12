import React from 'react';
import type { TextProps } from '../../../types/Text.types';

const Text: React.FC<TextProps> = ({ children, variant = 'body' }) => {
  const className = {
    body: '',
    caption: 'text-sm',
    muted: 'text-muted-foreground',
  }[variant];

  return <span className={className}>{children}</span>;
};

export default Text;