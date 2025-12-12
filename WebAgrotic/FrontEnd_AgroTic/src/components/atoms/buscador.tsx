import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { InputSearchProps } from "../../types/InputSearchProps";

const InputSearch: React.FC<InputSearchProps> = ({ placeholder, value, onChange, onKeyDown }) => {
    return (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder || "Buscar..."}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="w-64 h-9 px-3 py-2 pl-10 text-sm rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                name="search"
            />
            <MagnifyingGlassIcon className="w-3 h-3 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
    );
};

export default InputSearch;
    