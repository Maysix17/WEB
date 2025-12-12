import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Input } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import type { Cultivo } from '../../types/cultivos.types';
import { actualizarCantidadPlantas } from '../../services/cultivosVariedadZonaService';

interface UpdateCantidadPlantasModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: Cultivo;
  onSuccess: () => void;
}

const UpdateCantidadPlantasModal: React.FC<UpdateCantidadPlantasModalProps> = ({
  isOpen,
  onClose,
  cultivo,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    cantidad_plantas: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await actualizarCantidadPlantas(cultivo.cvzid, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating cantidad de plantas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent className="bg-white">
        <ModalHeader>
          <h2 className="text-lg font-semibold">Actualizar Cantidad de Plantas</h2>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Cantidad Actual: {cultivo.cantidad_plantas_actual || 'No registrada'}
          </label>
          <Input
            label="Nueva Cantidad de Plantas"
            type="number"
            value={formData.cantidad_plantas.toString()}
            onChange={(e) => setFormData({ ...formData, cantidad_plantas: parseInt(e.target.value) || 0 })}
            required
            min="0"
          />
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
            disabled={loading || formData.cantidad_plantas < 0}
          />
        </div>
      </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UpdateCantidadPlantasModal;