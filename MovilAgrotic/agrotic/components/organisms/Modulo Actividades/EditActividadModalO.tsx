import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import CampoTexto from '../../atoms/CampoTexto';
import Boton from '../../atoms/Boton';
import CustomAlertModal from '../../molecules/CustomAlertModal';
import { categoriaService } from '../../../services/Modulo Actividades/actividades/BuscarCategoria';
import zoneSearchService from '../../../services/Modulo Actividades/actividades/BuscarZona';
import { updateActividadCompleta } from '../../../services/Modulo Actividades/actividadesService';
import type { Actividad } from '../../../types/Modulo Actividades/Actividades.types';
import { usePermission } from '../../../contexts/PermissionContext';

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

interface EditActividadModalProps {
  isVisible: boolean;
  onClose: () => void;
  activity: Actividad | null;
  onActivityUpdated: () => void;
}

const EditActividadModalO: React.FC<EditActividadModalProps> = ({
  isVisible,
  onClose,
  activity,
  onActivityUpdated,
}) => {
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [loteSearch, setLoteSearch] = useState('');
  const [debouncedLoteSearch, setDebouncedLoteSearch] = useState('');

  const [selectedLote, setSelectedLote] = useState<Zona | null>(null);

  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [filteredZonas, setFilteredZonas] = useState<Zona[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // estado para modal de alertas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  const resetForm = () => {
    if (activity) {
      // Pre-populate form with existing activity data
      setCategoria(activity.fkCategoriaActividadId || '');
      setDescripcion(activity.descripcion || '');

      // Set selected lote
      if (activity.cultivoVariedadZona) {
        const tipoCultivoObj = activity.cultivoVariedadZona.cultivoXVariedad?.variedad?.tipoCultivo;
        const tipoCultivoName = (tipoCultivoObj && tipoCultivoObj.nombre) ? tipoCultivoObj.nombre : 'Tipo Cultivo';
        const variedadName = activity.cultivoVariedadZona.cultivoXVariedad?.variedad?.nombre || 'Variedad';
        const zoneName = activity.cultivoVariedadZona.zona?.nombre || 'Zona';

        setSelectedLote({
          id: activity.fkCultivoVariedadZonaId || '',
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

  useEffect(() => {
    if (isVisible && activity) {
      fetchCategorias();
      resetForm();
    }
  }, [isVisible, activity, hasPermission, isInitializing, lastUpdate]);

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

    setIsLoading(true);

    try {
      const updateData = {
        descripcion,
        fkCategoriaActividadId: categoria,
        fkCultivoVariedadZonaId: selectedLote?.id || '',
        usuarios: activity.usuariosAsignados?.filter((u: any) => u.activo).map((u: any) => u.usuario.id) || [],    
        materiales: activity.reservas?.map((r: any) => ({
          id: r.lote?.producto?.id || '',
          nombre: r.lote?.producto?.nombre || '',
          qty: r.cantidadReservada.toString(),
          isSurplus: false
        })) || [],
      };
  
      await updateActividadCompleta(activity.id, updateData);

      showAlert('Actualización exitosa', 'La actividad ha sido actualizada correctamente.', [
        { text: 'OK', onPress: () => {
          setAlertVisible(false);
          onActivityUpdated();
          onClose();
        }}
      ]);
    } catch (error) {
      console.error('Error updating actividad:', error);
      showAlert('Error', 'Error al actualizar la actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelect = (label: string, value: string, onChange: (value: string) => void, options: any[], placeholder: string) => (
    <View style={styles.selectContainer}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectScroll}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.selectOption, value === option.id && styles.selectedOption]}
            onPress={() => onChange(option.id)}
          >
            <Text style={[styles.selectOptionText, value === option.id && styles.selectedOptionText]}>
              {option.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!value && <Text style={styles.placeholderText}>{placeholder}</Text>}
    </View>
  );

  if (!activity) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar actividad</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Información Actual de la Actividad */}
            <View style={[styles.section, { backgroundColor: '#dbeafe', padding: 12, borderRadius: 8, marginBottom: 16 }]}>
              <Text style={[styles.sectionTitle, { color: '#1e40af', fontSize: 14 }]}>
                Información Actual de la Actividad
              </Text>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#1e40af', fontWeight: 'bold' }}>
                  Usuarios Asignados:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  {activity.usuariosAsignados?.filter(u => u.activo).map((uxa, idx) => (
                    <View key={idx} style={{ backgroundColor: '#bfdbfe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 4, marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: '#1e40af' }}>
                        {uxa.usuario.dni}
                      </Text>
                    </View>
                  )) || <Text style={{ fontSize: 12, color: '#6b7280' }}>Ninguno</Text>}
                </View>
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#1e40af', fontWeight: 'bold' }}>
                  Productos Reservados:
                </Text>
                <Text style={{ fontSize: 12, color: '#1e40af', marginTop: 4 }}>
                  {activity.reservas?.length ? `${activity.reservas.length} producto(s)` : 'Ninguno'}
                </Text>
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#1e40af', fontWeight: 'bold' }}>
                  Estado:
                </Text>
                <Text style={{ fontSize: 12, color: '#1e40af', marginTop: 4 }}>
                  Activa
                </Text>
              </View>
              <View style={{ marginTop: 8, padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
                <Text style={{ fontSize: 12, color: '#374151', fontWeight: 'bold' }}>
                  Nota:
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Solo se pueden editar descripción, categoría y lote.
                </Text>
              </View>
            </View>

            {/* Formulario de Edición */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Editar Detalles</Text>

              {renderSelect(
                'Categoría',
                categoria,
                setCategoria,
                categorias,
                'Seleccionar categoría'
              )}
              {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}

              <CampoTexto
                etiqueta="Descripción"
                marcador="Escriba..."
                valor={descripcion}
                alCambiar={setDescripcion}
                multiline
                numberOfLines={3}
              />
              {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}

              <CampoTexto
                etiqueta="Buscar lote"
                marcador="Escribe para buscar..."
                valor={loteSearch}
                alCambiar={setLoteSearch}
              />
              {debouncedLoteSearch.trim() && (
                <View style={[styles.searchResults, { zIndex: 1000, elevation: 10 }]}>
                  {filteredZonas.length === 0 ? (
                    <Text style={styles.noResults}>No se encontraron lotes</Text>
                  ) : (
                    filteredZonas.slice(0, 10).map((zona) => (
                      <TouchableOpacity
                        key={zona.id}
                        style={styles.searchItem}
                        onPress={() => handleSelectLote(zona)}
                      >
                        <Text style={styles.searchItemText}>{zona.nombre}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
              <View style={styles.selectedContainer}>
                {selectedLote && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{selectedLote.nombre}</Text>
                    <TouchableOpacity onPress={handleRemoveLote}>
                      <Text style={styles.chipRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {errors.lote && <Text style={styles.errorText}>{errors.lote}</Text>}

              <View style={styles.buttonContainer}>
                {/* Botón principal de actualizar actividad */}
                <Boton
                  text={isLoading ? "Actualizando..." : "Actualizar Actividad"}
                  onClick={handleSave}
                  disabled={isLoading}
                  color="primary"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  searchResults: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 8,
    position: 'relative',
  },
  searchItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  noResults: {
    padding: 12,
    textAlign: 'center',
    color: '#6b7280',
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipRemove: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  selectContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  selectScroll: {
    marginBottom: 8,
  },
  selectOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedOption: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
});

export default EditActividadModalO;