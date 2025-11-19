import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { searchCultivos } from "../../services/cultivosService";
import { zonasService, medicionSensorService } from "../../services/zonasService";
import apiClient from "../../lib/axios/axios";
import type { Cultivo } from "../../types/cultivos.types";
import type { Zona } from "../../types/zona.types";

interface SensorData {
  med_key: string;
  zonaNombre: string;
  cultivoNombre: string;
  variedadNombre: string;
}

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (selectedData: {
    cultivos: string[];
    zonas: string[];
    sensores: string[];
  }) => void;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Search and selection
  const [cultivoSearch, setCultivoSearch] = useState("");
  const [zonaSearch, setZonaSearch] = useState("");
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [selectedCultivos, setSelectedCultivos] = useState<string[]>([]);
  const [selectedZonas, setSelectedZonas] = useState<string[]>([]);

  // Step 2: Sensor selection
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    try {
      const [cultivosData, zonasData] = await Promise.all([
        searchCultivos({}),
        zonasService.getAll(),
      ]);
      setCultivos(cultivosData);
      setZonas(zonasData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Filter data based on search
  const filteredCultivos = cultivos.filter((cultivo) =>
    cultivo.nombrecultivo?.toLowerCase().includes(cultivoSearch.toLowerCase()) ||
    cultivo.tipoCultivo?.nombre?.toLowerCase().includes(cultivoSearch.toLowerCase())
  );

  const filteredZonas = zonas.filter((zona) =>
    zona.nombre?.toLowerCase().includes(zonaSearch.toLowerCase())
  );

  // Handle selection
  const handleCultivoSelect = (cultivoId: string) => {
    setSelectedCultivos(prev =>
      prev.includes(cultivoId)
        ? prev.filter(id => id !== cultivoId)
        : [...prev, cultivoId]
    );
  };

  const handleZonaSelect = (zonaId: string) => {
    setSelectedZonas(prev =>
      prev.includes(zonaId)
        ? prev.filter(id => id !== zonaId)
        : [...prev, zonaId]
    );
  };

  const handleSensorSelect = (medKey: string) => {
    setSelectedSensors(prev =>
      prev.includes(medKey)
        ? prev.filter(key => key !== medKey)
        : [...prev, medKey]
    );
  };

  // Fetch sensors for selected crops and zones
  const fetchSensors = async () => {
    if (selectedCultivos.length === 0 && selectedZonas.length === 0) return;

    setLoading(true);
    try {
      // First, get cultivos-zonas data to understand relationships
      const cultivosZonasResponse = await apiClient.get('/medicion-sensor/by-cultivos-zonas');
      const cultivosZonasData = cultivosZonasResponse.data;

      // Filter by selected cultivos and zonas
      const filteredCultivosZonas = cultivosZonasData.filter((item: any) => {
        const cultivoMatch = selectedCultivos.length === 0 || selectedCultivos.includes(item.cultivoId);
        const zonaMatch = selectedZonas.length === 0 || selectedZonas.includes(item.zonaId);
        return cultivoMatch && zonaMatch;
      });

      // Get unique zones from filtered data
      const uniqueZonas: string[] = Array.from(new Set(filteredCultivosZonas.map((item: any) => item.zonaId as string)));

      // Fetch sensors for each zone
      const sensorPromises = uniqueZonas.map(async (zonaId: string) => {
        try {
          const sensors = await medicionSensorService.getByZona(zonaId, 100); // Get more sensors to capture different keys
          return sensors;
        } catch (error) {
          console.error(`Error fetching sensors for zone ${zonaId}:`, error);
          return [];
        }
      });

      const sensorResults = await Promise.all(sensorPromises);
      const allSensors = sensorResults.flat();

      // Group sensors by med_key and associate with cultivos-zonas info
      const sensorMap = new Map<string, SensorData>();

      allSensors.forEach((sensor: any) => {
        if (!sensorMap.has(sensor.key)) {
          // Find the corresponding cultivo-zona info
          const relatedData = filteredCultivosZonas.find((item: any) => item.zonaId === sensor.zonaMqttConfig?.zona?.pk_id_zona);

          if (relatedData) {
            sensorMap.set(sensor.key, {
              med_key: sensor.key,
              zonaNombre: relatedData.zonaNombre,
              cultivoNombre: relatedData.cultivoNombre,
              variedadNombre: relatedData.variedadNombre,
            });
          }
        }
      });

      const uniqueSensors = Array.from(sensorMap.values());
      setSensors(uniqueSensors);
    } catch (error) {
      console.error("Error fetching sensors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const handleNext = async () => {
    if (currentStep === 1) {
      await fetchSensors();
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setSensors([]);
    setSelectedSensors([]);
  };

  const handleExport = () => {
    onExport({
      cultivos: selectedCultivos,
      zonas: selectedZonas,
      sensores: selectedSensors,
    });
    onClose();
    // Reset state
    setCurrentStep(1);
    setSelectedCultivos([]);
    setSelectedZonas([]);
    setSelectedSensors([]);
    setCultivoSearch("");
    setZonaSearch("");
    setSensors([]);
  };

  const canProceedToNext = selectedCultivos.length > 0 || selectedZonas.length > 0;
  const canExport = selectedSensors.length > 0;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl" className="max-h-[90vh]">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold">
            Export Report - Step {currentStep} of 2
          </h2>
        </ModalHeader>

        <ModalBody className="max-h-[60vh] overflow-y-auto">
          {currentStep === 1 ? (
            <div className="space-y-6">
              {/* Crops Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Crops</h3>
                <Input
                  placeholder="Search crops..."
                  value={cultivoSearch}
                  onChange={(e) => setCultivoSearch(e.target.value)}
                  className="mb-3"
                />
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {filteredCultivos.map((cultivo) => (
                    <div key={cultivo.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                      <Checkbox
                        isSelected={selectedCultivos.includes(cultivo.id)}
                        onValueChange={() => handleCultivoSelect(cultivo.id)}
                      />
                      <span className="text-sm">
                        {cultivo.nombrecultivo} - {cultivo.tipoCultivo?.nombre}
                      </span>
                    </div>
                  ))}
                </div>
                {selectedCultivos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected: {selectedCultivos.length} crops</p>
                  </div>
                )}
              </div>

              {/* Zones Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Zones</h3>
                <Input
                  placeholder="Search zones..."
                  value={zonaSearch}
                  onChange={(e) => setZonaSearch(e.target.value)}
                  className="mb-3"
                />
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {filteredZonas.map((zona) => (
                    <div key={zona.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                      <Checkbox
                        isSelected={selectedZonas.includes(zona.id)}
                        onValueChange={() => handleZonaSelect(zona.id)}
                      />
                      <span className="text-sm">{zona.nombre}</span>
                    </div>
                  ))}
                </div>
                {selectedZonas.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected: {selectedZonas.length} zones</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Sensors</h3>

              {loading ? (
                <div className="text-center py-8">Loading sensors...</div>
              ) : sensors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sensors found for the selected crops and zones.
                </div>
              ) : (
                <div className="space-y-3">
                  {sensors.map((sensor) => (
                    <Card key={sensor.med_key} className="cursor-pointer">
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              isSelected={selectedSensors.includes(sensor.med_key)}
                              onValueChange={() => handleSensorSelect(sensor.med_key)}
                            />
                            <div>
                              <p className="font-medium">{sensor.med_key}</p>
                              <p className="text-sm text-gray-600">
                                {sensor.cultivoNombre} - {sensor.variedadNombre} ({sensor.zonaNombre})
                              </p>
                            </div>
                          </div>
                          {selectedSensors.includes(sensor.med_key) && (
                            <Chip color="primary" size="sm">Selected</Chip>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {selectedSensors.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected {selectedSensors.length} of {sensors.length} sensors
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>

          {currentStep === 2 && (
            <Button variant="light" onPress={handleBack}>
              Back
            </Button>
          )}

          {currentStep === 1 ? (
            <Button
              color="primary"
              onPress={handleNext}
              isDisabled={!canProceedToNext}
            >
              Next
            </Button>
          ) : (
            <Button
              color="primary"
              onPress={handleExport}
              isDisabled={!canExport}
            >
              Export Report
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportReportModal;