import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';

interface FichaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichas: string[];
}

const FichaModal: React.FC<FichaModalProps> = ({ isOpen, onClose, fichas }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Fichas Involucradas</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-2">
            {fichas.length > 0 ? (
              fichas.map((ficha, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border">
                  {ficha.trim()}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay fichas disponibles</p>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FichaModal;