import React from "react";

interface CustomInputActivitiesProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder' | 'value' | 'onChange'> {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startContent?: React.ReactNode;
}

const CustomInputActivities: React.FC<CustomInputActivitiesProps> = ({
  placeholder,
  value,
  onChange,
  startContent,
  className,
  ...props
}) => {
  return (
    <div className={`
      relative flex items-center
      bg-gradient-to-r from-green-50 to-blue-50
      focus-within:ring-2 focus-within:ring-green-200
      shadow-sm
      transition-all duration-200
      rounded-lg
      border-0
      outline-none
      px-3 py-2
      ${className || ''}
    `}>
      {startContent && (
        <div className="mr-2 flex items-center">
          {startContent}
        </div>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          flex-1
          bg-transparent
          text-gray-700
          placeholder:text-gray-400
          font-medium
          outline-none
          border-none
          focus:outline-none
          focus:ring-0
        "
        {...props}
      />
    </div>
  );
};

export default CustomInputActivities;