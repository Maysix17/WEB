import React from 'react';

export type MenuButtonProps = {
  icon: React.ElementType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export type MenuItem = {
  label: string;
  icon: React.ElementType<React.SVGProps<SVGSVGElement>>;
};