import React from "react";
import type { TableProps } from "../../types/TableProps";

const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <table className="min-w-full rounded-lg shadow-md bg-white transition-all duration-300 ease-in-out">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-4 py-2 text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export default Table;

