import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CampoTexto from '../../atoms/CampoTexto';
import Boton from '../../atoms/Boton';
import CustomAlertModal from '../../molecules/CustomAlertModal';
import type { ItemCultivo } from '../../../types/Modulo Cultivos/Cultivos.types';
import apiClient from '../../../services/General/axios/axios';

interface UpdateCantidadPlantasModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: ItemCultivo | null;
  onSuccess: () => void;
}

const UpdateCantidadPlantasModal: React.FC<UpdateCantidadPlantasModalProps> = ({
  isOpen,
  onClose,
  cultivo,
  onSuccess,
}) => {
  const [cantidadPlantas, setCantidadPlantas] = useState('');
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

  const handleSubmit = async () => {
    if (!cultivo || !cantidadPlantas) return;

    const cantidad = parseInt(cantidadPlantas);
    if (isNaN(cantidad) || cantidad < 0) {
      showAlert('Error', 'Ingrese una cantidad válida');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/cultivos-variedad-x-zona/${cultivo.cvzid}/cantidad-plantas`, {
        cantidad_plantas: cantidad,
      });
      showAlert('Éxito', 'Cantidad de plantas actualizada', [
        { text: 'OK', onPress: () => {
          setAlertVisible(false);
          onSuccess();
          onClose();
        }}
      ]);
    } catch (error) {
      console.error('Error updating cantidad de plantas:', error);
      showAlert('Error', 'Error al actualizar la cantidad de plantas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Actualizar Cantidad de Plantas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>
              Cantidad Actual: {cultivo?.cantidad_plantas_actual || 'No registrada'}
            </Text>

            <CampoTexto
              etiqueta="Nueva Cantidad de Plantas"
              valor={cantidadPlantas}
              alCambiar={setCantidadPlantas}
              tipo="number"
              marcador="Ingrese la nueva cantidad"
            />

            <View style={styles.actions}>
              <Boton
                label={loading ? 'Actualizando...' : 'Actualizar'}
                onClick={handleSubmit}
                variant="solid"
                disabled={loading || !cantidadPlantas}
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
});

export default UpdateCantidadPlantasModal;