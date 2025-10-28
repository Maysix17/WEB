export interface CardField {
  label: string;
  value: string | React.ReactElement;
}

export interface CardAction {
  label?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'primary' | 'secondary' | 'danger' | 'default';
}

export interface MobileCardProps {
  fields: CardField[];
  actions: CardAction[];
  key?: string | number;
}