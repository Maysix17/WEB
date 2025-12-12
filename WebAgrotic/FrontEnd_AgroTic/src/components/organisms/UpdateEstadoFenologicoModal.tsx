import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import type { Cultivo, EstadoFenologico } from '../../types/cultivos.types';
import { actualizarEstadoFenologico } from '../../services/cultivosVariedadZonaService';
import { getEstadosFenologicos } from '../../services/estadosFenologicosService';

interface UpdateEstadoFenologicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: Cultivo;
  onSuccess: () => void;
}

const UpdateEstadoFenologicoModal: React.FC<UpdateEstadoFenologicoModalProps> = ({
  isOpen,
  onClose,
  cultivo,
  onSuccess,
}) => {
  const [estados, setEstados] = useState<EstadoFenologico[]>([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEstados();
      // Set current estado if exists
      if (cultivo.fk_estado_fenologico) {
        setSelectedEstadoId(cultivo.fk_estado_fenologico);
      }
    }
  }, [isOpen, cultivo]);

  const loadEstados = async () => {
    try {
      const data = await getEstadosFenologicos();
      setEstados(data);
    } catch (error) {
      console.error('Error loading estados fenológicos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstadoId) return;

    setLoading(true);
    try {
      await actualizarEstadoFenologico(cultivo.cvzid, selectedEstadoId);
      onSuccess();
    } catch (error) {
      console.error('Error updating estado fenológico:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent className="bg-white">
        <ModalHeader>
          <h2 className="text-lg font-semibold">Actualizar Estado Fenológico</h2>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Estado Fenológico Actual: {typeof cultivo.estado_fenologico === 'object' ? cultivo.estado_fenologico.nombre : (cultivo.estado_fenologico || 'No definido')}
          </label>
          <select
            className="w-full border border-gray-300 rounded-xl h-10 px-3"
            value={selectedEstadoId || ''}
            onChange={(e) => setSelectedEstadoId(parseInt(e.target.value) || null)}
            required
          >
            <option value="">Seleccionar estado fenológico</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre} - {estado.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <CustomButton
            label="Cancelar"
            onClick={onClose}
            variant="bordered"
            size="sm"
          />
          <CustomButton
            label={loading ? 'Actualizando...' : 'Actualizar'}
            type="submit"
            size="sm"
            disabled={loading || !selectedEstadoId}
          />
        </div>
      </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UpdateEstadoFenologicoModal;