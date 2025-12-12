import React from "react";
import MobileCard from "../atoms/MobileCard";
import type { CardField, CardAction } from "../../types/MobileCard.types";

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (item: any) => React.ReactNode;
}

interface GenericDataTableProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
  countLabel?: string;
  actions?: (item: any) => React.ReactNode;
  mobileFields?: (item: any) => CardField[];
  mobileActions?: (item: any) => CardAction[];
}

const GenericDataTable: React.FC<GenericDataTableProps> = ({
  data,
  columns,
  loading = false,
  emptyMessage = "No se encontraron resultados",
  emptyDescription = "No hay elementos que coincidan con los filtros aplicados.",
  onClearFilters,
  countLabel = "resultados",
  actions,
  mobileFields,
  mobileActions,
}) => {
  return (
    <>
      {/* Tabla escritorio */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden relative" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Resultados</h2>
          </div>
        </div>
        <div className="absolute top-4 right-6">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            {data.length} {data.length === 1 ? countLabel.slice(0, -1) : countLabel}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span className="text-gray-600">Cargando...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
            <p className="text-gray-500 mb-4">{emptyDescription}</p>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto h-full">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.width ? column.width : ''}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.map((item, index) => (
                  <tr key={item.id || index} className="h-14 hover:bg-gray-50/50 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-3 text-sm text-gray-900">
                        {column.render ? column.render(item) : getNestedValue(item, column.key)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden bg-white rounded-lg shadow-md overflow-hidden relative" style={{ height: 'calc(100vh - 320px)' }}>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Resultados</h2>
          </div>
        </div>
        <div className="absolute top-4 right-6">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            {data.length} {data.length === 1 ? countLabel.slice(0, -1) : countLabel}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span className="text-gray-600">Cargando...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
            <p className="text-gray-500 mb-4">{emptyDescription}</p>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3 overflow-y-auto h-full">
            {data.map((item, index) => {
              const fields = mobileFields ? mobileFields(item) : [];
              const cardActions = mobileActions ? mobileActions(item) : [];

              return (
                <MobileCard
                  key={item.id || index}
                  fields={fields}
                  actions={cardActions}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default GenericDataTable;