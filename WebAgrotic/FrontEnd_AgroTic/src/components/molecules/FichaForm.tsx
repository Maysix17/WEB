import React, { useState, useEffect } from 'react';
import CustomButton from '../atoms/Boton';
import { createFicha, updateFicha, getFichas } from '../../services/fichasService';

interface FichaFormProps {
  editId?: string | null;
  onSuccess?: () => void;
}

const FichaForm: React.FC<FichaFormProps> = ({ editId, onSuccess }) => {
  const [fichaData, setFichaData] = useState<{ numero: number }>({
    numero: 0,
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (editId) {
      // Fetch the existing data for editing
      const fetchFicha = async () => {
        try {
          const fichas = await getFichas();
          const ficha = fichas.find(f => f.id === editId);
          if (ficha) {
            setFichaData({ numero: ficha.numero });
          }
        } catch (error) {
          setMessage('Error al cargar datos para editar');
        }
      };
      fetchFicha();
    } else {
      setFichaData({ numero: 0 });
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateFicha(editId, fichaData);
        setMessage('Actualizado con éxito');
      } else {
        await createFicha(fichaData);
        setMessage('Registro exitoso');
      }
      setFichaData({ numero: 0 });
      onSuccess?.();
    } catch (error: any) {
      setMessage(error.message || 'Error en la operación');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Número de Ficha</label>
        <input
          type="number"
          value={fichaData.numero}
          onChange={(e) =>
            setFichaData({ numero: parseInt(e.target.value) || 0 })
          }
          placeholder="Ingrese el número de ficha"
          className="w-full border border-gray-300 rounded-lg p-2"
          required
          min="1"
        />
      </div>

      {message && <p className="text-center text-primary-600">{message}</p>}

      <CustomButton
        type="submit"
        text={editId ? 'Actualizar Ficha' : 'Registrar Ficha'}
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 w-full"
      />
    </form>
  );
};

export default FichaForm;