import React from 'react';
import Icon from '../atoms/Icons';
import type { MenuButtonProps } from '../../types/Menu.types';

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, active = false, onClick, className = "" }) => {
  return (
    <button
      className={`
        flex flex-col items-center justify-center py-2 px-2 w-full rounded-xl
        transition-all duration-150 ease-in-out select-none
        ${active
          ? 'bg-gray-200 text-gray-900 shadow-md'
          : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'}
        focus:outline-none
        ${className}
      `}
      onClick={onClick}
    >
      <Icon icon={icon} className={`w-6 h-6 mb-1.5 ${active ? 'text-gray-900' : 'text-gray-600'}`} />
      <span className={`text-sm font-semibold ${active ? 'text-gray-900' : 'text-gray-600'}`}>
        {label}
      </span>
    </button>
  );
};

export default MenuButton;
