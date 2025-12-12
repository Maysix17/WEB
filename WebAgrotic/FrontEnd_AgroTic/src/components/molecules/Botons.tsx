import React, { useState } from "react";
import Boton from "../atoms/Boton";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const FitosanitarioButtons: React.FC = () => {
    const [query, setQuery] = useState("");

    // Lista de botones
    const buttons = ["Subir Mapa", "Registrar zona", "Riego", "Fertilización", "Control de Plagas"];

    // Filtrar botones según el input
    const filteredButtons = buttons.filter((b) =>
        b.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 w-80">
            {/* Buscador con lupa */}
            <div className="relative w-full">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Buscar opción..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
            </div>

            {/* Botones */}
            <div className="flex gap-4 flex-wrap">
                {filteredButtons.map((label) => (
                    <Boton key={label} label={label} />
                ))}
            </div>
        </div>
    );
};

export default FitosanitarioButtons;
