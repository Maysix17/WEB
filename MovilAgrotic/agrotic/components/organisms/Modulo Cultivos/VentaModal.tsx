import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CampoTexto from '@/components/atoms/CampoTexto';
import Boton from '@/components/atoms/Boton';
import CustomAlertModal from '@/components/molecules/CustomAlertModal';
import { ventaService } from '@/services/Modulo Cultivos/ventaService';
import { cosechasService } from '@/services/Modulo Cultivos/cosechasService';
import type { ItemCultivo } from '@/types/Modulo Cultivos/Cultivos.types';
import type { Cosecha } from '@/types/Modulo Cultivos/Cosechas.types';
import { usePermission } from '../../../contexts/PermissionContext';

interface VentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: ItemCultivo | null;
  onSuccess: () => void;
}


const VentaModal: React.FC<VentaModalProps> = ({ isOpen, onClose, cultivo, onSuccess }) => {
  console.log('VentaModal render - isOpen:', isOpen, 'cultivo:', cultivo);

  const [formData, setFormData] = useState({
    cantidad: 0,
    fecha: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(), // YYYY-MM-DD format for date input
    unidadMedida: 'kg',
    precioUnitario: 0,
  });
  const [cosechasDisponibles, setCosechasDisponibles] = useState<Cosecha[]>([]);
  const [selectedHarvests, setSelectedHarvests] = useState<{id: string, cantidad: number}[]>([]);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  console.log('VentaModal state - cosechasDisponibles:', cosechasDisponibles.length, 'selectedHarvests:', selectedHarvests.length, 'totalAvailable:', totalAvailable);


  const { hasPermission, isInitializing } = usePermission();

  const isPerenne = cultivo?.tipoCultivo?.esPerenne || false;

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (isOpen && cultivo) {
      loadCosechasDisponibles();
    }
  }, [isOpen, cultivo]);

  useEffect(() => {
    if (selectedHarvests.length > 0) {
      const total = selectedHarvests.reduce((sum, harvest) => {
        const cosecha = cosechasDisponibles.find(c => c.id === harvest.id);
        const disponible = cosecha?.cantidadDisponible || 0;
        return sum + disponible;
      }, 0);
      setTotalAvailable(total);
    } else {
      setTotalAvailable(0);
    }
  }, [selectedHarvests, cosechasDisponibles]);

  const loadCosechasDisponibles = async () => {
    if (!cultivo) {
      console.log('loadCosechasDisponibles - no cultivo');
      return;
    }

    console.log('loadCosechasDisponibles - loading for cultivo:', cultivo.cvzid);
    try {
      const cosechas = await cosechasService.getCosechasAbiertasByCultivo(cultivo.cvzid);
      console.log('loadCosechasDisponibles - cosechas loaded:', cosechas?.length || 0);
      // Filter unique cosechas to avoid duplicates
      const uniqueCosechas = (cosechas || []).filter((c, index, arr) => arr.findIndex(c2 => c2.id === c.id) === index);
      setCosechasDisponibles(uniqueCosechas);

      // Auto-select all available harvests
      if (cosechas && cosechas.length > 0) {
        const availableHarvests = cosechas.filter(c => (c.cantidadDisponible || 0) > 0);
        console.log('loadCosechasDisponibles - available harvests:', availableHarvests.length);
        setSelectedHarvests(availableHarvests.map(c => ({ id: c.id, cantidad: c.cantidadDisponible || 0 })));
      } else {
        console.log('loadCosechasDisponibles - no cosechas available');
      }
    } catch (error) {
      console.error('Error loading cosechas:', error);
      setCosechasDisponibles([]);
      setSelectedHarvests([]);
    }
  };

  const handleSubmit = async () => {
    // Validations
    if (selectedHarvests.length === 0) {
      showAlert('Error', 'Debe seleccionar al menos una cosecha');
      return;
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      showAlert('Error', 'La cantidad es obligatoria y debe ser mayor a 0');
      return;
    }

    // Check cantidad format: cannot start with ., special chars
    const cantidadStr = formData.cantidad.toString();
    if (!/^[0-9]/.test(cantidadStr)) {
      showAlert('Error', 'La cantidad no puede iniciar con un punto o carácter especial');
      return;
    }
    if (!/^[0-9]+(\.[0-9]*)?$/.test(cantidadStr)) {
      showAlert('Error', 'La cantidad debe ser un número válido');
      return;
    }

    if (formData.cantidad > totalAvailable) {
      showAlert('Error', `La cantidad no puede superar los ${totalAvailable} ${cosechasDisponibles[0]?.unidadMedida || 'kg'} disponibles`);
      return;
    }

    if (!formData.fecha) {
      showAlert('Error', 'La fecha es obligatoria');
      return;
    }

    if (!formData.precioUnitario || formData.precioUnitario <= 0) {
      showAlert('Error', 'El precio unitario es obligatorio y debe ser mayor a 0');
      return;
    }

    // Check precioUnitario format: no special chars, up to 15 digits
    const precioStr = formData.precioUnitario.toString();
    if (!/^[0-9]+(\.[0-9]*)?$/.test(precioStr)) {
      showAlert('Error', 'El precio unitario debe ser un número válido sin caracteres especiales');
      return;
    }
    if (precioStr.replace('.', '').length > 15) {
      showAlert('Error', 'El precio unitario no puede tener más de 15 dígitos');
      return;
    }

    const ventaData = {
      ...formData,
      multipleHarvests: selectedHarvests,
      fkCosechaId: selectedHarvests[0].id,
    };

    setLoading(true);
    try {
      await ventaService.createVenta(ventaData);
      await loadCosechasDisponibles();
      onSuccess();
      onClose();
    } catch (error: any) {
      showAlert('Error', error.message || 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleHarvestSelection = (harvestId: string) => {
    const isSelected = selectedHarvests.some(h => h.id === harvestId);
    if (isSelected) {
      setSelectedHarvests(prev => prev.filter(h => h.id !== harvestId));
    } else {
      const cosecha = cosechasDisponibles.find(c => c.id === harvestId);
      if (cosecha) {
        setSelectedHarvests(prev => [...prev, { id: harvestId, cantidad: cosecha.cantidadDisponible || 0 }]);
      }
    }
  };

  console.log('VentaModal render - about to render modal, isOpen:', isOpen);

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Venta</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          {cultivo && (
            <View style={styles.cultivoInfo}>
              <Text>Cultivo: {cultivo.tipo_cultivo_nombre || cultivo.tipoCultivo?.nombre} {cultivo.nombrecultivo}</Text>
              <Text>Variedad: {cultivo.nombrecultivo}</Text>
              <Text>Lote: {cultivo.lote}</Text>
            </View>
          )}

          <KeyboardAvoidingView
            style={styles.scrollContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            {/* Harvest Selection */}
            <View style={styles.section}>
              {cosechasDisponibles.length > 0 ? (
                <>
                  <ScrollView style={styles.harvestList}>
                    {cosechasDisponibles
                      .filter(cosecha => (cosecha.cantidadDisponible || 0) > 0)
                      .map((cosecha) => (
                        <TouchableOpacity
                          key={cosecha.id}
                          style={[
                            styles.harvestItem,
                            selectedHarvests.some(h => h.id === cosecha.id) && styles.harvestItemSelected
                          ]}
                          onPress={() => toggleHarvestSelection(cosecha.id)}
                        >
                          <Text style={styles.harvestText}>
                            {cosecha.fecha ? new Date(cosecha.fecha).toLocaleDateString() : 'Sin fecha'} - {cosecha.cantidadDisponible} {cosecha.unidadMedida}
                          </Text>
                          {selectedHarvests.some(h => h.id === cosecha.id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                  {selectedHarvests.length > 0 && (
                    <View style={styles.totalInfo}>
                      <Text style={styles.totalText}>Cosechas seleccionadas: {selectedHarvests.length}</Text>
                      <Text style={styles.totalText}>Total disponible: {totalAvailable} {cosechasDisponibles[0]?.unidadMedida || 'kg'}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.noHarvestsText}>No hay cosechas disponibles para este cultivo</Text>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.section}>
              <Text style={styles.label}>Unidad de Medida</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    showAlert(
                      "Unidad de Medida",
                      "Selecciona la unidad:",
                      [
                        { text: "Kilogramos", onPress: () => { handleChange('unidadMedida', 'kg'); setAlertVisible(false); } },
                      {/*} { text: "Libras", onPress: () => { handleChange('unidadMedida', 'lb'); setAlertVisible(false); } }*/},
                        { text: "Cancelar", onPress: () => setAlertVisible(false), style: "cancel" }
                      ]
                    );
                  }}
                >
                  <Text style={styles.pickerText}>
                    {formData.unidadMedida === 'kg' ? 'Kilogramos' : 'Libras'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <CampoTexto
                etiqueta="Cantidad"
                marcador="Ingrese la cantidad"
                valor={formData.cantidad.toString()}
                alCambiar={(value) => handleChange('cantidad', parseFloat(value) || 0)}
                tipo="number"
                maxLength={10}
              />
              {selectedHarvests.length > 0 && (
                <Text style={styles.maxAvailableText}>
                  Máximo disponible: {totalAvailable} {cosechasDisponibles[0]?.unidadMedida || 'kg'}
                </Text>
              )}

              <View style={styles.dateInputContainer}>
                <Text style={styles.label}>Fecha</Text>
                <TouchableOpacity
                  style={styles.datePickerWide}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {formData.fecha ? formData.fecha.split('-').reverse().join('/') : 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <CampoTexto
                etiqueta={`Precio por ${formData.unidadMedida === 'kg' ? 'Kilo' : 'Libra'}`}
                marcador="Ingrese el precio unitario"
                valor={formData.precioUnitario.toString()}
                alCambiar={(value) => handleChange('precioUnitario', parseFloat(value) || 0)}
                tipo="number"
                maxLength={15}
              />
            </View>
            </ScrollView>
          </KeyboardAvoidingView>

          
          {!isInitializing && hasPermission('Cultivos', 'cultivos', 'crear') && (
          <View style={styles.actions}>
            <Boton label="Registrar" onClick={handleSubmit} variant="solid" disabled={loading} />
          </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={formData.fecha ? new Date(formData.fecha) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && event.type !== 'dismissed') {
              const localDate = selectedDate.getFullYear() + '-' +
                (selectedDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
                selectedDate.getDate().toString().padStart(2, '0');
              handleChange('fecha', localDate);
            }
          }}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '95%',
    maxWidth: 450,
    flex: 1,
    flexDirection: 'column',
    maxHeight: '95%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  cultivoInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  scrollContent: {
    flex: 1,
    minHeight: 300,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectAllButton: {
    padding: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  harvestList: {
    maxHeight: 200,
  },
  harvestItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginBottom: 4,
  },
  harvestItemSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  totalText: {
    marginTop: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  selectAllText: {
    fontSize: 14,
    color: '#374151',
  },
  harvestText: {
    fontSize: 14,
    color: '#374151',
  },
  checkmark: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  totalInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  noHarvestsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  maxAvailableText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  datePickerWide: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 50,
  },
  datePickerText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default VentaModal;