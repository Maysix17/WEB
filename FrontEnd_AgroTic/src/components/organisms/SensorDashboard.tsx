import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Spinner, Badge } from '@heroui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { medicionSensorService, zonasService } from '../../services/zonasService';
import { getAllCultivos } from '../../services/cultivosService';
import { useMqttSocket } from '../../hooks/useMqttSocket';
import CustomButton from '../atoms/Boton';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import MqttManagementModal from '../molecules/MqttManagementModal';

interface SensorDashboardProps {
  filters: Record<string, any>;
}

interface SensorData {
  [key: string]: {
    unit: string;
    history: Array<{ value: number; timestamp: string; zonaId: string; cultivoNombre?: string }>;
    lastValue: number;
    lastUpdate: string;
    zonaNombre: string;
    cultivoNombre?: string;
  };
}

import type { Cultivo } from '../../types/cultivos.types';

const SensorDashboard: React.FC<SensorDashboardProps> = ({ filters }) => {
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [zonas, setZonas] = useState<any[]>([]);
  const [showMqttManagementModal, setShowMqttManagementModal] = useState(false);

  // Use MQTT socket hook for real-time updates
  const { lecturas } = useMqttSocket();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (Object.keys(sensorData).length > 0) {
      // Apply filters when sensorData or filters change
      const filteredData = applyFilters(sensorData);
      // Update display or something, but for now, just log
    }
  }, [filters, sensorData]);

  // Effect to update sensor data with real-time MQTT readings
  useEffect(() => {
    if (lecturas.length > 0) {
      setSensorData(prevData => {
        const newData = { ...prevData };
        let hasUpdates = false;

        lecturas.forEach(lectura => {
          const zona = zonas.find(z => z.id === lectura.zonaId);
          if (!zona) return;

          const cultivo = cultivos.find(c => zona.cultivos?.some((zc: any) => zc.cultivoId === c.id));
          const cultivoNombre = cultivo?.tipoCultivo?.nombre;

          lectura.mediciones.forEach(medicion => {
            const sensorKey = medicion.key;
            const newValue = Number(medicion.valor);

            if (!newData[sensorKey]) {
              newData[sensorKey] = {
                unit: medicion.unidad,
                history: [{ value: newValue, timestamp: medicion.fechaMedicion, zonaId: lectura.zonaId, cultivoNombre }],
                lastValue: newValue,
                lastUpdate: medicion.fechaMedicion,
                zonaNombre: zona.nombre,
                cultivoNombre,
              };
              hasUpdates = true;
            } else {
              newData[sensorKey].lastValue = newValue;
              newData[sensorKey].lastUpdate = medicion.fechaMedicion;
              newData[sensorKey].history.push({ value: newValue, timestamp: medicion.fechaMedicion, zonaId: lectura.zonaId, cultivoNombre });
              // Keep only last 50 values
              if (newData[sensorKey].history.length > 50) {
                newData[sensorKey].history = newData[sensorKey].history.slice(-50);
              }
              hasUpdates = true;
            }
          });
        });

        return hasUpdates ? newData : prevData;
      });
    }
  }, [lecturas, zonas, cultivos]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [mediciones, zonasData, cultivosData] = await Promise.all([
        medicionSensorService.getAll(),
        zonasService.getAll(),
        getAllCultivos()
      ]);

      setZonas(zonasData);
      setCultivos(cultivosData);

      processMediciones(mediciones, zonasData, cultivosData);
    } catch (error) {
      console.error('Error loading sensor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMediciones = (mediciones: any[], zonasData: any[], cultivosData: Cultivo[]) => {
    const data: SensorData = {};

    mediciones.forEach(medicion => {
      const zona = zonasData.find(z => z.id === medicion.fkZonaId);
      if (!zona) return;

      const cultivo = cultivosData.find(c => zona.cultivos?.some((zc: any) => zc.cultivoId === c.id));
      const cultivoNombre = cultivo?.tipoCultivo?.nombre;

      if (!data[medicion.key]) {
        data[medicion.key] = {
          unit: medicion.unidad,
          history: [],
          lastValue: medicion.valor,
          lastUpdate: medicion.fechaMedicion,
          zonaNombre: zona.nombre,
          cultivoNombre,
        };
      }

      data[medicion.key].history.push({
        value: medicion.valor,
        timestamp: medicion.fechaMedicion,
        zonaId: medicion.fkZonaId,
        cultivoNombre
      });

      // Keep only last 50 values
      if (data[medicion.key].history.length > 50) {
        data[medicion.key].history = data[medicion.key].history.slice(-50);
      }

      // Update if this is more recent
      if (new Date(medicion.fechaMedicion) > new Date(data[medicion.key].lastUpdate)) {
        data[medicion.key].lastValue = medicion.valor;
        data[medicion.key].lastUpdate = medicion.fechaMedicion;
      }
    });

    setSensorData(data);
  };

  const applyFilters = (data: SensorData): SensorData => {
    const zonaFilter = filters.zona?.toLowerCase() || '';
    const cultivoFilter = filters.cultivo?.toLowerCase() || '';

    const filtered: SensorData = {};

    Object.entries(data).forEach(([key, sensor]) => {
      const matchesZona = !zonaFilter || sensor.zonaNombre.toLowerCase().includes(zonaFilter);
      const matchesCultivo = !cultivoFilter || (sensor.cultivoNombre && sensor.cultivoNombre.toLowerCase().includes(cultivoFilter));

      if (matchesZona && matchesCultivo) {
        filtered[key] = sensor;
      }
    });

    return filtered;
  };

  const filteredSensorData = applyFilters(sensorData);
  const sensorEntries = Object.entries(filteredSensorData);

  const prepareChartData = (data: SensorData) => {
    // Get all timestamps
    const allTimestamps = new Set<string>();
    Object.values(data).forEach(sensor => {
      sensor.history.forEach(point => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return sortedTimestamps.map((timestamp, index) => {
      const point: any = { timestamp, index, time: new Date(timestamp).getTime() };
      Object.entries(data).forEach(([key, sensor]) => {
        const historyPoint = sensor.history.find(h => h.timestamp === timestamp);
        if (historyPoint) {
          point[key] = historyPoint.value;
        }
      });
      return point;
    });
  };

  // Prepare chart data
  const chartData = sensorEntries.length > 0 ? prepareChartData(filteredSensorData) : [];

  // Sensor Card Component
  const SensorCard = React.memo(({ sensorKey, data }: { sensorKey: string; data: SensorData[string] }) => {
    const chartData = data.history.slice(-20).map((point, index) => ({
      time: index,
      value: point.value,
      timestamp: point.timestamp,
    }));

    const formatSensorKey = (key: string) => {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    };

    return (
      <Card className="w-full max-w-xs">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="text-center flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{formatSensorKey(sensorKey)}</h3>
            <p className="text-xs text-gray-600">{data.zonaNombre} {data.cultivoNombre && `(${data.cultivoNombre})`}</p>
          </div>
          <Badge color="success" variant="flat" className="ml-2">
            Activo
          </Badge>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {Number(data.lastValue).toFixed(2)} <span className="text-lg text-green-700">{data.unit}</span>
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Última actualización: {new Date(data.lastUpdate).toLocaleString()}
              </div>
            </div>

          </div>
        </CardBody>
      </Card>
    );
  });

  const handleExport = () => {
    // Generate CSV for export
    const csvData = generateCSV(filteredSensorData);
    downloadCSV(csvData, 'reporte_sensores.csv');
  };

  const generateCSV = (data: SensorData): string => {
    const headers = ['Sensor', 'Zona', 'Cultivo', 'Valor', 'Unidad', 'Fecha'];
    const rows: string[] = [headers.join(',')];

    Object.entries(data).forEach(([key, sensor]) => {
      sensor.history.forEach(point => {
        const row = [
          key,
          sensor.zonaNombre,
          sensor.cultivoNombre || '',
          point.value.toString(),
          sensor.unit,
          point.timestamp
        ];
        rows.push(row.map(field => `"${field}"`).join(','));
      });
    });

    return rows.join('\n');
  };

  const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6">
      {/* Header with export and broker button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard de Sensores
            </h1>

            {/* Toolbar compacto */}
            <div className="flex items-center gap-3">
              <CustomButton
                color="success"
                variant="solid"
                onClick={handleExport}
                label="Exportar Reporte"
                icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                className="rounded-lg px-3 py-1 h-8"
              />

              <CustomButton
                variant="light"
                size="sm"
                label="Bróker"
                onClick={() => setShowMqttManagementModal(true)}
                className="rounded-lg px-3 py-1 h-8 text-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Spinner size="lg" color="primary" />
              <p className="mt-2 text-gray-600">Cargando datos de sensores...</p>
            </div>
          ) : sensorEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              No hay datos de sensores disponibles.
              <br />
              <small className="text-gray-400">Los datos aparecerán aquí cuando los sensores estén conectados y activos.</small>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sensor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sensorEntries.map(([key, data]) => (
                  <SensorCard key={key} sensorKey={key} data={data} />
                ))}
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-800">Gráfica de Sensores</h3>
                  <p className="text-sm text-gray-600">Valores en tiempo real de los sensores</p>
                </CardHeader>
                <CardBody>
                  <div className="h-96">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="time"
                            type="number"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                            domain={['dataMin', 'dataMax']}
                            tickCount={10}
                          />
                          <YAxis
                            label={{ value: 'Valor', angle: -90, position: 'insideLeft' }}
                            domain={[0, (dataMax) => Math.ceil(dataMax / 10) * 10 + 5]}
                            tickCount={10}
                          />
                          <Tooltip
                            labelFormatter={(value) => `Hora: ${new Date(value).toLocaleString()}`}
                            formatter={(value: any, name: any) => [
                              `${Number(value).toFixed(2)} ${filteredSensorData[name]?.unit || ''}`,
                              String(name).replace(/([A-Z])/g, ' $1').toLowerCase()
                            ]}
                          />
                          {sensorEntries.map(([key], index) => (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                              strokeWidth={2}
                              dot={false}
                              connectNulls={true}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No hay datos suficientes para mostrar la gráfica
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showMqttManagementModal && (
        <MqttManagementModal
          isOpen={showMqttManagementModal}
          onClose={() => setShowMqttManagementModal(false)}
        />
      )}
    </div>
  );
};

export default SensorDashboard;