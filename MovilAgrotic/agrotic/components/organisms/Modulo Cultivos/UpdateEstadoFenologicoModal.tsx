import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Boton from '../../atoms/Boton';
import CustomAlertModal from '../../molecules/CustomAlertModal';
import type { ItemCultivo , EstadoFenologico } from '../../../types/Modulo Cultivos/Cultivos.types';

import apiClient from '../../../services/General/axios/axios';

interface UpdateEstadoFenologicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: ItemCultivo | null;
  onSuccess: () => void;
}

const UpdateEstadoFenologicoModal: React.FC<UpdateEstadoFenologicoModalProps> = ({
  isOpen,
  onClose,
  cultivo,
  onSuccess,
}) => {
  const [estados, setEstados] = useState<EstadoFenologico[]>([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      loadEstados();
      // Reset selection
      setSelectedEstadoId(null);
    }
  }, [isOpen, cultivo]);

  const loadEstados = async () => {
    try {
      const response = await apiClient.get('/estados-fenologicos');
      setEstados(response.data);
    } catch (error) {
      console.error('Error loading estados fenológicos:', error);
      showAlert('Error', 'No se pudieron cargar los estados fenológicos');
    }
  };

  const handleSubmit = async () => {
    if (!selectedEstadoId || !cultivo) return;

    setLoading(true);
    try {
      await apiClient.put(`/cultivos-variedad-x-zona/${cultivo.cvzid}/estado-fenologico`, {
        fk_estado_fenologico: selectedEstadoId,
      });
      showAlert('Éxito', 'Estado fenológico actualizado', [
        { text: 'OK', onPress: () => {
          setAlertVisible(false);
          onSuccess();
          onClose();
        }}
      ]);
    } catch (error) {
      console.error('Error updating estado fenológico:', error);
      showAlert('Error', 'Error al actualizar el estado fenológico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Actualizar Estado Fenológico</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>
              Estado Fenológico Actual: {cultivo?.estado_fenologico_nombre || cultivo?.estado_fenologico || 'No definido'}
            </Text>

            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  showAlert(
                    "Estado Fenológico",
                    "Selecciona el estado:",
                    [
                      ...estados.map(estado => ({
                        text: `${estado.nombre} - ${estado.descripcion || ''}`,
                        onPress: () => { setSelectedEstadoId(estado.id); setAlertVisible(false); }
                      })),
                      { text: "Cancelar", onPress: () => setAlertVisible(false), style: "cancel" }
                    ]
                  );
                }}
              >
                <Text style={styles.pickerText}>
                  {selectedEstadoId ? estados.find(e => e.id === selectedEstadoId)?.nombre || 'Seleccionado' : 'Seleccionar estado fenológico'}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <Boton
                label={loading ? 'Actualizando...' : 'Actualizar'}
                onClick={handleSubmit}
                variant="solid"
                disabled={loading || !selectedEstadoId}
              />
            </View>
          </View>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 20,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default UpdateEstadoFenologicoModal;