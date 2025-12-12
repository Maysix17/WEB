import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CampoTexto from '@/components/atoms/CampoTexto';
import Boton from '@/components/atoms/Boton';
import CustomAlertModal from '@/components/molecules/CustomAlertModal';
import { cosechasService } from '@/services/Modulo Cultivos/cosechasService';
import type { CreateCosechaDto } from '@/types/Modulo Cultivos/Cosechas.types';
import type { ItemCultivo } from '@/types/Modulo Cultivos/Cultivos.types';
import { usePermission } from '@/contexts/PermissionContext';

interface CosechaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvzId: string;
  onSuccess: () => void;
  isPerenne?: boolean;
  cultivo?: ItemCultivo | null;
}

const CosechaModal: React.FC<CosechaModalProps> = ({
  isOpen,
  onClose,
  cvzId,
  onSuccess,
  cultivo
}) => {
  const [formData, setFormData] = useState<CreateCosechaDto>({
    unidadMedida: 'kg',
    cantidad: 0,
    fecha: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    fkCultivosVariedadXZonaId: cvzId,
    cantidad_plantas_cosechadas: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, fkCultivosVariedadXZonaId: cvzId }));
    } else {
      resetForm();
    }
  }, [isOpen, cvzId]);

  const handleSubmit = async () => {
    // Validations
    if (!formData.cantidad || formData.cantidad <= 0) {
      setAlertTitle('Error');
      setAlertMessage('La cantidad es obligatoria y debe ser mayor a 0');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    // Check cantidad format: cannot start with special char, ., ,, after number can have .
    const cantidadStr = formData.cantidad.toString();
    if (!/^[0-9]/.test(cantidadStr)) {
      setAlertTitle('Error');
      setAlertMessage('La cantidad no puede iniciar con un carácter especial, punto o coma');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }
    if (!/^[0-9]+(\.[0-9]*)?$/.test(cantidadStr)) {
      setAlertTitle('Error');
      setAlertMessage('La cantidad debe ser un número válido');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    if (!formData.fecha) {
      setAlertTitle('Error');
      setAlertMessage('La fecha es obligatoria');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    if (!formData.cantidad_plantas_cosechadas || formData.cantidad_plantas_cosechadas <= 0) {
      setAlertTitle('Error');
      setAlertMessage('La cantidad de plantas cosechadas es obligatoria y debe ser mayor a 0');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    // Check plantas cosechadas is integer
    if (!Number.isInteger(formData.cantidad_plantas_cosechadas)) {
      setAlertTitle('Error');
      setAlertMessage('La cantidad de plantas cosechadas debe ser un número entero');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    if (!formData.fkCultivosVariedadXZonaId) return;

    const dataToSend = { ...formData };
    if (formData.cantidad_plantas_cosechadas && formData.cantidad_plantas_cosechadas > 0) {
      dataToSend.rendimiento_por_planta = formData.cantidad / formData.cantidad_plantas_cosechadas;
    }

    setLoading(true);
    try {
      await cosechasService.createCosecha(dataToSend);
      onSuccess();
      onClose();
    } catch (error: any) {
      setAlertTitle('Error');
      setAlertMessage(error.message || 'Error al registrar cosecha');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCosechaDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      unidadMedida: 'kg',
      cantidad: 0,
      fecha: (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      fkCultivosVariedadXZonaId: cvzId,
      cantidad_plantas_cosechadas: undefined,
    });
  };

  const { hasPermission, isInitializing } = usePermission();

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Cosecha</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {cultivo && (
              <View style={styles.cultivoInfo}>
                <Text>Cultivo: {cultivo.tipo_cultivo_nombre || cultivo.tipoCultivo?.nombre} {cultivo.nombrecultivo}</Text>
                <Text>Variedad: {cultivo.nombrecultivo}</Text>
                <Text>Lote: {cultivo.lote}</Text>
              </View>
            )}

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Unidad de Medida</Text>
              <Text style={styles.unidadMedidaText}>Kilogramos (kg)</Text>
            </View>

            <CampoTexto
              etiqueta="Cantidad"
              valor={formData.cantidad.toString()}
              alCambiar={(value) => handleChange('cantidad', parseFloat(value) || 0)}
              tipo="number"
              maxLength={10}
            />

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
              etiqueta="Cantidad de Plantas Cosechadas"
              valor={formData.cantidad_plantas_cosechadas?.toString() || ''}
              alCambiar={(value) => handleChange('cantidad_plantas_cosechadas', parseInt(value) || undefined)}
              tipo="number"
              maxLength={10}
            />

            {formData.cantidad_plantas_cosechadas && formData.cantidad > 0 && (
              <Text style={styles.rendimiento}>
                Rendimiento por planta: {(formData.cantidad / formData.cantidad_plantas_cosechadas).toFixed(2)} {formData.unidadMedida}/planta
              </Text>
            )}
          </ScrollView>

          {!isInitializing && hasPermission('Cultivos', 'cultivos', 'crear') && (
          <View style={styles.actions}>
            <Boton label="Registrar" onClick={handleSubmit} variant="solid" disabled={loading} />
          </View>
          )}
        </View>
      </View>

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxWidth: 450,
    flex: 1,
    flexDirection: 'column',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  cultivoInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rendimiento: {
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
    textAlign: 'center',
  },
  actions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  unidadMedidaText: {
    fontSize: 16,
    color: '#374151',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  scrollContent: {
    flex: 1,
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
    paddingVertical: 4,
    paddingHorizontal: 10,
    height: 40,
  },
  datePickerText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default CosechaModal;