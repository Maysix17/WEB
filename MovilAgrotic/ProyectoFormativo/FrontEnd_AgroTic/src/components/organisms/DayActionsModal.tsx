import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import CustomButton from '../atoms/Boton';

interface DayActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewList: () => void;
  onCreateNew: () => void;
}

const DayActionsModal: React.FC<DayActionsModalProps> = ({ isOpen, onClose, onViewList, onCreateNew }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-semibold">Acciones para el día</h2>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3">
            <CustomButton onClick={onViewList} className="w-full" label="Ver Lista de Actividades" />
            <CustomButton onClick={onCreateNew} className="w-full" color="primary" label="Crear Nueva Actividad" />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DayActionsModal;