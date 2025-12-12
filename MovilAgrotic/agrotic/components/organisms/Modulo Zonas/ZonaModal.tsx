import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { zonaService, type Zona } from '../../../services/Modulo Zonas/zonaService';
// Map functionality removed
// import MapViewComponent from '../../molecules/MapView';

interface ZonaModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  zona?: Zona | null;
}

const ZonaModal: React.FC<ZonaModalProps> = ({
  isVisible,
  onClose,
  onSave,
  zona,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    coordenadas: null as any,
    areaMetrosCuadrados: '',
  });
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingType, setDrawingType] = useState<'point' | 'polygon'>('point');

  useEffect(() => {
    if (isVisible) {
      if (zona) {
        setFormData({
          nombre: zona.nombre || '',
          coordenadas: zona.coordenadas || null,
          areaMetrosCuadrados: zona.areaMetrosCuadrados?.toString() || '',
        });
      } else {
        setFormData({
          nombre: '',
          coordenadas: null,
          areaMetrosCuadrados: '',
        });
      }
      setDrawingMode(false);
      setDrawingType('point');
    }
  }, [isVisible, zona]);

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (!formData.coordenadas) {
      Alert.alert('Error', 'Debe seleccionar una ubicación en el mapa');
      return;
    }

    const area = formData.areaMetrosCuadrados ? parseFloat(formData.areaMetrosCuadrados) : undefined;

    setLoading(true);
    try {
      if (zona) {
        await zonaService.update(zona.id, {
          nombre: formData.nombre,
          coordenadas: formData.coordenadas,
          areaMetrosCuadrados: area,
        });
      } else {
        await zonaService.create({
          nombre: formData.nombre,
          coordenadas: formData.coordenadas,
          areaMetrosCuadrados: area,
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving zona:', error);
      Alert.alert('Error', 'No se pudo guardar la zona');
    } finally {
      setLoading(false);
    }
  };

  const handleCoordinatesChange = (coordinates: any) => {
    setFormData(prev => ({ ...prev, coordenadas: coordinates }));
  };

  const toggleDrawing = () => {
    setDrawingMode(!drawingMode);
  };

  const clearDrawing = () => {
    setFormData(prev => ({ ...prev, coordenadas: null }));
    setDrawingMode(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {zona ? 'Editar Zona' : 'Crear Zona'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={styles.content}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={styles.formSection}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                  placeholder="Nombre de la zona"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Área (m²)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.areaMetrosCuadrados}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, areaMetrosCuadrados: text }))}
                  placeholder="Área en metros cuadrados"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de ubicación</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.typeButton, drawingType === 'point' && styles.typeButtonActive]}
                    onPress={() => setDrawingType('point')}
                  >
                    <Text style={[styles.typeButtonText, drawingType === 'point' && styles.typeButtonTextActive]}>
                      Punto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, drawingType === 'polygon' && styles.typeButtonActive]}
                    onPress={() => setDrawingType('polygon')}
                  >
                    <Text style={[styles.typeButtonText, drawingType === 'polygon' && styles.typeButtonTextActive]}>
                      Lote
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Acciones</Text>
                <Text style={styles.helpText}>
                  {drawingMode ?
                    (drawingType === 'point' ? "Toca el mapa para colocar un punto" : "Toca varios puntos para dibujar un lote. Mantén presionado para finalizar.") :
                    "Activa el modo dibujo para interactuar con el mapa"
                  }
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, drawingMode && styles.actionButtonActive]}
                    onPress={toggleDrawing}
                  >
                    <Text style={[styles.actionButtonText, drawingMode && styles.actionButtonTextActive]}>
                      {drawingMode ? 'Detener' : 'Dibujar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={clearDrawing}
                  >
                    <Text style={styles.actionButtonText}>Limpiar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.mapSection}>
              <View style={styles.mapControls}>
                <Text style={styles.mapControlText}>
                  Funcionalidad de mapa deshabilitada
                </Text>
              </View>
              <View style={styles.mapContainer}>
                <Text style={{ textAlign: 'center', padding: 20 }}>
                  Los mapas han sido removidos. Las coordenadas deben ser ingresadas manualmente o desde otra fuente.
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '95%',
    height: '90%',
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
    flexDirection: 'column',
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  actionButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtonTextActive: {
    color: '#ffffff',
  },
  mapSection: {
    flex: 1,
  },
  mapControls: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mapControlButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 2,
  },
  mapControlButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  mapControlText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  mapControlTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ZonaModal;