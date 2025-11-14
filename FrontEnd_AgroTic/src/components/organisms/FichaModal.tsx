import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import FichaForm from '../molecules/FichaForm';
import type { Ficha } from '../../services/fichasService';
import {
  getFichas,
  deleteFicha,
} from '../../services/fichasService';
import Table from '../atoms/Table';
import CustomButton from '../atoms/Boton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FichaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FichaModal: React.FC<FichaModalProps> = ({ isOpen, onClose }) => {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchFichas();
    }
  }, [isOpen]);

  const fetchFichas = async () => {
    try {
      const data = await getFichas();
      setFichas(data);
    } catch (err) {
      console.error('Error fetching fichas:', err);
    }
  };

  const handleEdit = (ficha: Ficha) => {
    setEditId(ficha.id);
    // Note: The form will handle the edit logic
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta ficha?')) {
      try {
        await deleteFicha(id);
        fetchFichas();
        setMessage('Eliminado con éxito');
      } catch (err) {
        setMessage('Error al eliminar');
      }
    }
  };

  const headers = ['Número de Ficha', 'Acciones'];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Gestionar Fichas</h2>
        </ModalHeader>
        <ModalBody className="overflow-y-auto max-h-96">
          <FichaForm editId={editId} onSuccess={() => { fetchFichas(); setEditId(null); }} />
          {message && <p className="text-center text-green-600 mt-4">{message}</p>}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Lista de Fichas</h3>
            <Table headers={headers}>
              {fichas.map((ficha) => (
                <tr key={ficha.id}>
                  <td className="px-4 py-2 border-b">{ficha.numero}</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-1">
                      <CustomButton
                        icon={<PencilIcon className="w-4 h-4" />}
                        tooltip="Editar"
                        onClick={() => handleEdit(ficha)}
                        color="secondary"
                        variant="light"
                        size="sm"
                      />
                      <CustomButton
                        icon={<TrashIcon className="w-4 h-4" />}
                        tooltip="Eliminar"
                        onClick={() => handleDelete(ficha.id)}
                        color="danger"
                        variant="light"
                        size="sm"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FichaModal;