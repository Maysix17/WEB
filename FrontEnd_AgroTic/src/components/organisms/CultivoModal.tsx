import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import CultivoForm from '../molecules/CultivoForm';

interface CultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CultivoModal: React.FC<CultivoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Registrar Nuevo Cultivo</h2>
        </ModalHeader>
        <ModalBody>
          <CultivoForm onSuccess={() => { onSuccess?.(); onClose(); }} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CultivoModal;