import React from 'react';
import CustomButton from './Boton';
import type { MobileCardProps } from '../../types/MobileCard.types';

const MobileCard: React.FC<MobileCardProps> = ({ fields, actions }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm w-full">
      {/* Datos organizados en una línea */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className="flex justify-between items-center text-sm text-gray-800 flex-wrap"
          >
            <span className="font-semibold text-gray-700">{field.label}:</span>
            <span className="ml-2 text-gray-900 break-words text-right">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Botones responsivos */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200 justify-center">
          {actions.map((action, index) => (
            action.icon ? (
              <CustomButton
                key={index}
                icon={action.icon}
                tooltip={action.tooltip}
                onClick={action.onClick}
                color={action.color || 'primary'}
                variant={action.variant || 'light'}
                ariaLabel={action.tooltip}
                size="sm"
              />
            ) : (
              <CustomButton
                key={index}
                label={action.label}
                onClick={action.onClick}
                size="sm"
                variant={action.variant || 'solid'}
                className="flex-1 min-w-[45%] text-xs px-2 py-2 sm:px-3 sm:py-2"
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileCard;
