import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { medicionSensorService, type MedicionSensor } from '../../services/Modulo Zonas/zonaService';

interface SensorReadingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  zonaId: string;
  zonaNombre: string;
}

const SensorReadingsModal: React.FC<SensorReadingsModalProps> = ({
  isOpen,
  onClose,
  zonaId,
  zonaNombre,
}) => {
  const [readings, setReadings] = useState<MedicionSensor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReadings();
    }
  }, [isOpen]);

  const loadReadings = async () => {
    try {
      setLoading(true);
      const data = await medicionSensorService.getByZona(zonaId, 50); // Last 50 readings
      setReadings(data);
    } catch (error) {
      console.error('Error loading sensor readings:', error);
      Alert.alert('Error', 'No se pudieron cargar las lecturas del sensor');
    } finally {
      setLoading(false);
    }
  };

  const renderReadingItem = ({ item }: { item: MedicionSensor }) => (
    <View style={styles.readingItem}>
      <View style={styles.readingInfo}>
        <Text style={styles.readingKey}>{item.key}</Text>
        <Text style={styles.readingValue}>
          {item.valor} {item.unidad}
        </Text>
      </View>
      <Text style={styles.readingDate}>
        {new Date(item.fechaMedicion).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Lecturas de Sensores - {zonaNombre}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Cargando lecturas...</Text>
              </View>
            ) : readings.length === 0 ? (
              <Text style={styles.emptyText}>No hay lecturas disponibles</Text>
            ) : (
              <FlatList
                data={readings}
                renderItem={renderReadingItem}
                keyExtractor={(item) => `${item.id}-${item.fechaMedicion}`}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButtonFooter}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20,
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  readingInfo: {
    flex: 1,
  },
  readingKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  readingDate: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  closeButtonFooter: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SensorReadingsModal;