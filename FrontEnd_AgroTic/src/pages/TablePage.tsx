// pages/TablePage.tsx
import React, { useState } from "react";
import ResultsTable from "../components/organisms/ResultsTable";
import InputSearch from "../components/atoms/buscador";
import type { ResultItem } from "../types/ResultItem";

const TablePage: React.FC = () => {
  const [results] = useState<ResultItem[]>([
    { lote: "Sur", cultivo: "Plátano", sensor: "pH de suelo", fecha: "2025-08-30" },
    { lote: "Norte", cultivo: "Cacao", sensor: "Temperatura ambiente", fecha: "2025-08-29" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = results.filter(
    (item) =>
      item.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sensor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (item: ResultItem) => {
    alert(`Detalles del lote: ${item.lote}\nCultivo: ${item.cultivo}\nSensor: ${item.sensor}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Resultados de Búsqueda</h1>

      <InputSearch
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por lote o sensor..."
      />

      <ResultsTable data={filteredResults} onView={handleView} />
    </div>
  );
};

export default TablePage;
