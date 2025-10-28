import React from "react";
import Table from "../atoms/Table";
import TableRow from "../molecules/TableRow";
import MobileCard from "../atoms/MobileCard";
import type { CardField, CardAction } from "../../types/MobileCard.types";
import type { ResultsTableProps } from "../../types/ResultsTableProps";

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onView }) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table headers={["Lote", "Cultivo", "Sensor", "Acciones"]}>
          {data.map((item, index) => (
            <TableRow key={index} item={item} onView={onView} />
          ))}
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item, index) => {
          const fields: CardField[] = [
            { label: 'Lote', value: item.lote },
            { label: 'Cultivo', value: item.cultivo },
            { label: 'Sensor', value: item.sensor },
          ];

          const actions: CardAction[] = [
            {
              label: 'Ver más',
              onClick: () => onView(item),
              size: 'sm',
            },
          ];

          return <MobileCard key={index} fields={fields} actions={actions} />;
        })}
      </div>
    </>
  );
};

export default ResultsTable;
