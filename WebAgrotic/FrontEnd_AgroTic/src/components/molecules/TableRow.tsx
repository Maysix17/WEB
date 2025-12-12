import React from "react";
import CustomButton from "../atoms/Boton";
import type { TableRowProps } from "../../types/TableRowProps";

const TableRow: React.FC<TableRowProps> = ({ item, onView }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200 ease-in-out">
      <td className="px-4 py-2">{item.lote}</td>
      <td className="px-4 py-2">{item.cultivo}</td>
      <td className="px-4 py-2">{item.sensor}</td>
      <td className="px-4 py-2 text-center">
        <CustomButton onClick={() => onView(item)}>Ver más</CustomButton>
      </td>
    </tr>
  );
};

export default TableRow;
