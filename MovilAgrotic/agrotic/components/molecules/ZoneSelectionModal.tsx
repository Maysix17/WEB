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
import { zonaService } from '../../services/Modulo Zonas/zonaService';

interface Zona {
  id: string;
  nombre: string;
  zonaMqttConfigs?: any[];
}

interface ZoneSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ZoneSelectionModal: React.FC<ZoneSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadZonas();
    }
  }, [isOpen]);

  const loadZonas = async () => {
    try {
      setLoading(true);
      const zonasData = await zonaService.getAll();
      setZonas(zonasData);
    } catch (error) {
      console.error('Error loading zones:', error);
      Alert.alert('Error', 'No se pudieron cargar las zonas');
    } finally {
      setLoading(false);
    }
  };

  const handleZonePress = (zona: Zona) => {
    // For now, just show an alert. In a full implementation,
    // this would open the MqttSelectionModal for this zone
    Alert.alert(
      'Configurar MQTT',
      `¿Desea configurar MQTT para la zona "${zona.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Configurar',
          onPress: () => {
            // Here you would typically open MqttSelectionModal
            // For now, we'll just close and call onSave
            onSave();
            onClose();
          }
        }
      ]
    );
  };

  const renderZonaItem = ({ item }: { item: Zona }) => {
    const hasMqttConfig = item.zonaMqttConfigs && item.zonaMqttConfigs.filter(config => config.estado).length > 0;
    const configCount = item.zonaMqttConfigs?.filter(config => config.estado).length || 0;

    return (
      <TouchableOpacity
        style={styles.zonaItem}
        onPress={() => handleZonePress(item)}
      >
        <View style={styles.zonaInfo}>
          <Text style={styles.zonaName}>{item.nombre}</Text>
          <Text style={styles.zonaStatus}>
            {hasMqttConfig
              ? `${configCount} configuración${configCount > 1 ? 'es' : ''} MQTT conectada${configCount > 1 ? 's' : ''}`
              : 'Sin configuración MQTT'
            }
          </Text>
        </View>
        <View style={[styles.statusIndicator, hasMqttConfig && styles.statusActive]}>
          <Text style={[styles.statusText, hasMqttConfig && styles.statusTextActive]}>
            {hasMqttConfig ? '✓' : '○'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.title}>Seleccionar Zona</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Cargando zonas...</Text>
              </View>
            ) : (
              <FlatList
                data={zonas}
                renderItem={renderZonaItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No hay zonas disponibles</Text>
                }
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cerrar</Text>
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
  zonaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  zonaInfo: {
    flex: 1,
  },
  zonaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  zonaStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusActive: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e',
  },
  statusText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: '#ffffff',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ZoneSelectionModal;