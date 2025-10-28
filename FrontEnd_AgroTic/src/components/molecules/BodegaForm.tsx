import React, { useState, useEffect } from 'react';
import CustomButton from '../atoms/Boton';
import type { BodegaData } from '../../types/bodega.types';
import { registerBodega, updateBodega, getBodegas } from '../../services/bodegaService';

interface BodegaFormProps {
  editId?: string | null;
  onSuccess?: () => void;
}

const BodegaForm: React.FC<BodegaFormProps> = ({ editId, onSuccess }) => {
  const [bodegaData, setBodegaData] = useState<BodegaData>({
    numero: '',
    nombre: '',
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (editId) {
      // Fetch the existing data for editing
      const fetchBodega = async () => {
        try {
          const bodegas = await getBodegas();
          const bodega = bodegas.find(b => b.id === editId);
          if (bodega) {
            setBodegaData({ numero: bodega.numero, nombre: bodega.nombre });
          }
        } catch (error) {
          setMessage('Error al cargar datos para editar');
        }
      };
      fetchBodega();
    } else {
      setBodegaData({ numero: '', nombre: '' });
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateBodega(editId, bodegaData);
        setMessage('Actualizado con éxito');
      } else {
        await registerBodega(bodegaData);
        setMessage('Registro exitoso');
      }
      setBodegaData({ numero: '', nombre: '' });
      onSuccess?.();
    } catch (error: any) {
      setMessage(error.message || 'Error en la operación');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Número</label>
        <input
          type="text"
          value={bodegaData.numero}
          onChange={(e) =>
            setBodegaData({ ...bodegaData, numero: e.target.value })
          }
          placeholder="Ingrese el número de la bodega"
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={bodegaData.nombre}
          onChange={(e) =>
            setBodegaData({ ...bodegaData, nombre: e.target.value })
          }
          placeholder="Ingrese el nombre de la bodega"
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      {message && <p className="text-center text-primary-600">{message}</p>}

      <CustomButton
        type="submit"
        text={editId ? 'Actualizar Bodega' : 'Registrar Bodega'}
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 w-full"
      />
    </form>
  );
};

export default BodegaForm;