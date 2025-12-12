import React from "react";
import { Input } from "@heroui/react";
import type { InputActivitiesProps } from "../../types/InputActivitiesProps";

const InputActivities: React.FC<InputActivitiesProps> = ({
  placeholder,
  value,
  onChange,
  startContent,
  ...props
}) => {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      startContent={startContent}
      classNames={{
        inputWrapper: [
          "custom-input", // Mark as custom to avoid global styles
          "bg-gradient-to-r from-green-50 to-blue-50",
          "focus-within:ring-2 focus-within:ring-green-200",
          "shadow-sm",
          "transition-all duration-200",
          "rounded-lg",
          "border-0", // Remove border
          "outline-none", // Remove outline
        ],
        input: [
          "text-gray-700",
          "placeholder:text-gray-400",
          "font-medium",
          "outline-none", // Remove outline from input
          "border-none", // Remove border from input
        ],
      }}
      {...props}
    />
  );
};

export default InputActivities;