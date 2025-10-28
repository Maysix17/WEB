import React from "react";
import type { InputSearchProps } from "../../types/InputSearchProps.ts";

const InputSearch: React.FC<InputSearchProps> = ({ value, onChange, onKeyDown, placeholder }) => {
  return (
    <input
      type="text"
      placeholder={placeholder || "Buscar..."}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className="w-[200px] px-3 py-1 text-sm rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
};

export default InputSearch;
