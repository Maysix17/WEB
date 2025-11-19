import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Chip,
  Checkbox,
} from '@heroui/react';
import { MagnifyingGlassIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { medicionSensorService } from '../../services/zonasService';
import { generateSensorSearchPDF } from '../../utils/pdfGenerator';

interface SensorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SensorData {
  key: string;
  unidad: string;
  valor: number;
  fechaMedicion: string;
}

interface SensorConfig {
  id: string;
  nombre: string;
  host: string;
  port: number;
  protocol: string;
  topicBase: string;
}

interface CultivoZonaSensor {
  cultivoId: string;
  cultivoNombre: string;
  variedadNombre: string;
  tipoCultivoNombre: string;
  zonaId: string;
  zonaNombre: string;
  cvzId: string;
  sensorConfig: SensorConfig;
  uniqueSensorData: SensorData[];
}

const SensorSearchModal: React.FC<SensorSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sensorData, setSensorData] = useState<CultivoZonaSensor[]>([]);
  const [filteredData, setFilteredData] = useState<CultivoZonaSensor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSensorData();
    }
  }, [isOpen]);

  useEffect(() => {
    filterData();
  }, [searchTerm, sensorData]);

  const loadSensorData = async () => {
    setIsLoading(true);
    try {
      const data = await medicionSensorService.getSensorSearchData();
      setSensorData(data.results || []);
    } catch (error) {
      console.error('Error loading sensor search data:', error);
      setSensorData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm.trim()) {
      setFilteredData(sensorData);
      return;
    }

    const filtered = sensorData.filter(item =>
      item.cultivoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.zonaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variedadNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipoCultivoNombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleSensorSelection = (sensorKey: string) => {
    const newSelected = new Set(selectedSensors);
    if (newSelected.has(sensorKey)) {
      newSelected.delete(sensorKey);
    } else {
      newSelected.add(sensorKey);
    }
    setSelectedSensors(newSelected);
  };

  const handleExportPDF = async () => {
    if (selectedSensors.size === 0) {
      alert('Por favor selecciona al menos un sensor para exportar');
      return;
    }

    setIsExporting(true);
    try {
      const selectedDetails = Array.from(selectedSensors).map(uniqueKey => {
        const parts = uniqueKey.split('-');
        const cultivoId = parts[0];
        const zonaId = parts[1];
        const sensorKey = parts[parts.length - 1]; // The type like 'Temperatura'
        const item = sensorData.find(i => i.cultivoId === cultivoId && i.zonaId === zonaId);
        const zonaNombre = item?.zonaNombre || '';
        const cultivoNombre = item?.cultivoNombre || '';
        const variedadNombre = item?.variedadNombre || '';
        return { cultivoId, zonaId, sensorKey, zonaNombre, cultivoNombre, variedadNombre };
      });
      await generateSensorSearchPDF(selectedDetails);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-6 h-6" />
          Búsqueda de Sensores por Cultivo y Zona
        </ModalHeader>
        <ModalBody>
          {/* Search Input */}
          <div className="mb-6">
            <Input
              placeholder="Buscar por cultivo, zona, variedad o tipo de cultivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
              endContent={
                searchTerm && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={clearSearch}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                )
              }
              className="w-full"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Spinner size="lg" color="primary" />
              <p className="mt-2 text-gray-600">Cargando datos de sensores...</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && (
            <div className="space-y-4">
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No se encontraron resultados para la búsqueda.' : 'No hay datos de sensores disponibles.'}
                </div>
              ) : (
                filteredData.map((item, index) => (
                  <Card key={`${item.cultivoId}-${item.zonaId}`} className="w-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.tipoCultivoNombre}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Variedad: {item.variedadNombre} | Zona: {item.zonaNombre}
                          </p>
                        </div>
                        <Badge color="success" variant="flat">
                          {item.uniqueSensorData.length} sensor(es)
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      {/* Unique Sensor Data */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Datos de Mediciones (Únicos)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {item.uniqueSensorData.map((sensor, sensorIndex) => {
                            const uniqueKey = `${item.cultivoId}-${item.zonaId}-${sensor.key}`;
                            return (
                              <div
                                key={uniqueKey}
                                className="p-3 border border-gray-200 rounded-lg bg-white"
                              >
                                <Checkbox
                                  isSelected={selectedSensors.has(uniqueKey)}
                                  onValueChange={() => toggleSensorSelection(uniqueKey)}
                                  className="w-full [&>span>svg]:text-black"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-medium">{sensor.key}</span>
                                    <span className="text-xs text-gray-500">{sensor.unidad}</span>
                                  </div>
                                </Checkbox>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <div className="text-sm text-gray-600">
            {selectedSensors.size > 0 && (
              <span>{selectedSensors.size} sensor(es) seleccionado(s)</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="light" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              className="bg-[#15A55A] hover:bg-[#15A55A]/80 text-white"
              onClick={handleExportPDF}
              isLoading={isExporting}
              startContent={!isExporting ? <DocumentArrowDownIcon className="w-4 h-4" /> : undefined}
              isDisabled={selectedSensors.size === 0}
            >
              {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SensorSearchModal;