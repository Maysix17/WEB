import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { zonasService, type Zona } from '../../services/zonasService';
import CustomButton from '../atoms/Boton';
import MqttSelectionModal from './MqttSelectionModal';

interface ZoneSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ZoneSelectionModal: React.FC<ZoneSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [showMqttModal, setShowMqttModal] = useState(false);
  const [cropsData, setCropsData] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      loadZonas();
    }
  }, [isOpen]);

  const loadZonas = async () => {
    try {
      setLoading(true);
      const data = await zonasService.getAll();
      setZonas(data);

      // Fetch crops for all zones using Promise.all
      const cropsPromises = data.map(zona => zonasService.getZonaCultivosVariedadXZona(zona.id));
      const cropsResults = await Promise.all(cropsPromises);

      const cropsMap: Record<string, string[]> = {};
      data.forEach((zona, index) => {
        const cultivos = cropsResults[index].cultivos || [];
        const cropNames = cultivos.map((c: any) => c.cultivo?.nombre).filter(Boolean) as string[];
        cropsMap[zona.id] = cropNames;
      });
      setCropsData(cropsMap);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectZona = (zona: Zona) => {
    setSelectedZona(zona);
    setShowMqttModal(true);
  };

  const handleMqttSave = () => {
    onSave();
    loadZonas(); // Refresh zones in case MQTT assignments changed
  };

  const handleCloseMqttModal = () => {
    setShowMqttModal(false);
    setSelectedZona(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="xl">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-lg font-semibold">Seleccionar Zona para Configurar Bróker</h2>
          </ModalHeader>

          <ModalBody>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando zonas...</p>
              </div>
            ) : zonas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay zonas disponibles</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {zonas.map((zona) => (
                   <div key={zona.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                     <div className="flex items-center justify-between">
                       <div>
                         <h3 className="font-medium text-gray-900">{zona.nombre}</h3>
                         {cropsData[zona.id] && cropsData[zona.id].length > 0 && (
                           <p className="text-sm text-gray-600">Cultivos: {cropsData[zona.id].join(', ')}</p>
                         )}
                       </div>
                       <CustomButton
                         type="button"
                         text="Configurar Bróker"
                         onClick={() => handleSelectZona(zona)}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                       />
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <CustomButton
              type="button"
              text="Cerrar"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
            />
          </ModalFooter>
        </ModalContent>
      </Modal>

      {selectedZona && (
        <MqttSelectionModal
          isOpen={showMqttModal}
          onClose={handleCloseMqttModal}
          zonaId={selectedZona.id}
          zonaNombre={selectedZona.nombre}
          onSave={handleMqttSave}
        />
      )}
    </>
  );
};

export default ZoneSelectionModal;