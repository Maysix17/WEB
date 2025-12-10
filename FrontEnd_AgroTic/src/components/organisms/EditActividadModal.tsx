import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Select, SelectItem, Chip, Textarea } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import zoneSearchService from '../../services/zoneSearchService';
import categoriaService from '../../services/categoriaService';
import InputSearch from '../atoms/buscador';
import { updateActividad } from '../../services/actividadesService';
import Swal from 'sweetalert2';

interface Categoria {
  id: string;
  nombre: string;
}

interface Zona {
  id: string;
  nombre: string;
  zonaId?: string;
  cultivoId?: string;
  variedadNombre?: string;
}

interface Activity {
  id: string;
  descripcion: string;
  fechaAsignacion: string;
  categoriaActividad: { id: string; nombre: string };
  cultivoVariedadZona: {
    id: string;
    zona: { nombre: string };
    cultivoXVariedad: {
      cultivo: { nombre: string };
      variedad: { nombre: string; tipoCultivo?: { nombre: string } };
    };
  };
  usuariosAsignados?: { usuario: { id: string; dni: number; nombres: string; apellidos: string }; activo: boolean }[];
  reservas?: {
    id: string;
    lote: {
      id: string;
      producto: {
        id: string;
        nombre: string;
        unidadMedida: { abreviatura: string };
      };
    };
    cantidadReservada: number;
  }[];
}

interface EditActividadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onActivityUpdated: () => void;
}

const EditActividadModal: React.FC<EditActividadModalProps> = ({
  isOpen,
  onClose,
  activity,
  onActivityUpdated
}) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [loteSearch, setLoteSearch] = useState('');

  const [debouncedLoteSearch, setDebouncedLoteSearch] = useState('');

  const [selectedLote, setSelectedLote] = useState<Zona | null>(null);

  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [filteredZonas, setFilteredZonas] = useState<Zona[]>([]);

  // Reset form when modal opens or activity changes
  const resetForm = () => {
    if (activity) {
      // Pre-populate form with existing activity data
      setCategoria(activity.categoriaActividad.id);
      setDescripcion(activity.descripcion);

      // Set selected lote
      if (activity.cultivoVariedadZona) {
        const tipoCultivoObj = activity.cultivoVariedadZona.cultivoXVariedad?.variedad?.tipoCultivo;
        const tipoCultivoName = (tipoCultivoObj && tipoCultivoObj.nombre) ? tipoCultivoObj.nombre : 'Tipo Cultivo';
        const variedadName = activity.cultivoVariedadZona.cultivoXVariedad?.variedad?.nombre || 'Variedad';
        const zoneName = activity.cultivoVariedadZona.zona?.nombre || 'Zona';

        setSelectedLote({
          id: activity.cultivoVariedadZona.id,
          nombre: `${tipoCultivoName} - ${variedadName} - ${zoneName}`,
          zonaId: zoneName,
          cultivoId: activity.cultivoVariedadZona.cultivoXVariedad?.cultivo?.nombre || 'Cultivo',
          variedadNombre: variedadName,
        });
      }
    }

    // Clear search fields
    setLoteSearch('');
    setDebouncedLoteSearch('');
    setFilteredZonas([]);
    setErrors({});
  };

  // Fetch categorias and reset form when modal opens or activity changes
  useEffect(() => {
    if (isOpen && activity) {
      fetchCategorias();
      resetForm();
    }
  }, [isOpen, activity]);

  // Debounce lote search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoteSearch(loteSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [loteSearch]);

  const fetchCategorias = async () => {
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };


  // Filter zonas with search
  useEffect(() => {
    const fetchFilteredZonas = async () => {
      if (debouncedLoteSearch.trim()) {
        try {
          const data = await zoneSearchService.search(debouncedLoteSearch);
          setFilteredZonas(data.items);
        } catch (error) {
          console.error('Error searching zonas:', error);
          setFilteredZonas([]);
        }
      } else {
        setFilteredZonas([]);
      }
    };
    fetchFilteredZonas();
  }, [debouncedLoteSearch]);

  const handleSelectLote = (zona: Zona) => {
    setSelectedLote(zona);
    setLoteSearch('');
  };

  const handleRemoveLote = () => {
    setSelectedLote(null);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'Ingresa una descripción';
    }

    if (!selectedLote) {
      newErrors.lote = 'Ingresa una ubicación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!activity) return;

    // Validate required fields
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        descripcion,
        fkCategoriaActividadId: categoria,
        fkCultivoVariedadZonaId: selectedLote?.id,
      };

      await updateActividad(activity.id, updateData);

      Swal.fire({
        title: 'Actualización exitosa',
        text: 'La actividad ha sido actualizada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });

      onActivityUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating actividad:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar la actividad',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  if (!activity) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-2xl font-semibold">Editar actividad</h2>
        </ModalHeader>
        <ModalBody>
          {/* Información Actual de la Actividad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Información Actual de la Actividad</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Usuarios Asignados:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activity?.usuariosAsignados?.filter(u => u.activo).map((uxa, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {uxa.usuario.dni}
                    </span>
                  )) || <span className="text-gray-500">Ninguno</span>}
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-700">Productos Reservados:</span>
                <div className="mt-1">
                  {activity?.reservas?.length ? (
                    <span className="text-blue-800">{activity.reservas.length} producto(s)</span>
                  ) : (
                    <span className="text-gray-500">Ninguno</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-700">Estado:</span>
                <span className="ml-2 text-blue-800">Activa</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white rounded border text-sm">
              <span className="font-medium text-gray-700">Nota:</span> Solo se pueden editar descripción, categoría y lote. Los usuarios y reservas deben gestionarse por separado.
            </div>
          </div>

          {/* Formulario de Edición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Select
                  label="Seleccione categoría"
                  selectedKeys={categoria ? [categoria] : []}
                  onSelectionChange={(keys) => setCategoria(Array.from(keys)[0] as string)}
                >
                  {Array.isArray(categorias) ? categorias.map((cat) => (
                    <SelectItem key={cat.id}>
                      {cat.nombre}
                    </SelectItem>
                  )) : []}
                </Select>
                {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>}
              </div>
              <div>
                <Textarea
                  label="Descripción"
                  placeholder="Escriba..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium mb-2">Seleccione un lote</label>
                <InputSearch
                  placeholder="Buscar lote a seleccionar..."
                  value={loteSearch}
                  onChange={(e) => setLoteSearch(e.target.value)}
                />
                <div className={`overflow-auto border rounded p-2 bg-white transition-all duration-300 ease-in-out ${debouncedLoteSearch.trim() ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {debouncedLoteSearch.trim() && (
                    <>
                      {filteredZonas.length === 0 ? (
                        <div className="text-gray-500 text-sm p-2">No se encontraron lotes</div>
                      ) : (
                        filteredZonas.map((zona) => (
                          <button
                            key={zona.id}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded"
                            onClick={() => handleSelectLote(zona)}
                          >
                            {zona.nombre}
                          </button>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Seleccionado</label>
                <div className="flex flex-wrap gap-2">
                  {selectedLote && (
                    <Chip key={selectedLote.id} onClose={handleRemoveLote} variant="flat">
                      {selectedLote.nombre}
                    </Chip>
                  )}
                </div>
                {errors.lote && <p className="text-red-500 text-sm mt-1">{errors.lote}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <CustomButton variant="light" onClick={onClose} label="Cancelar" />
                <CustomButton color="primary" onClick={handleSave} label="Actualizar actividad" />
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditActividadModal;