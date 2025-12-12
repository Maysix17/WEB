import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { zonaService, type Zona } from '@/services/Modulo Zonas/zonaService';

const ZonaPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const zonaParam = params.zona ? JSON.parse(params.zona as string) : undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    coordenadas: null as any,
    areaMetrosCuadrados: '',
  });
  const [coordinateType, setCoordinateType] = useState<'point' | 'polygon'>('point');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [polygonPoints, setPolygonPoints] = useState<{lat: string, lng: string}[]>([]);

  useEffect(() => {
    if (zonaParam) {
      setFormData({
        nombre: zonaParam.nombre || '',
        coordenadas: zonaParam.coordenadas || null,
        areaMetrosCuadrados: zonaParam.areaMetrosCuadrados?.toString() || '',
      });
    }
  }, [zonaParam]);

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
      if (zonaParam) {
        // Llamada al servicio zonaService.update() para actualizar una zona existente
        await zonaService.update(zonaParam.id, {
          nombre: formData.nombre,
          coordenadas: formData.coordenadas,
          areaMetrosCuadrados: area,
        });
      } else {
        // Llamada al servicio zonaService.create() para crear una nueva zona
        await zonaService.create({
          nombre: formData.nombre,
          coordenadas: formData.coordenadas,
          areaMetrosCuadrados: area,
        });
      }
      router.back();
    } catch (error) {
      console.error('Error saving zona:', error);
      Alert.alert('Error', 'No se pudo guardar la zona');
    } finally {
      setLoading(false);
    }
  };

  const handleCoordinatesChange = () => {
    if (coordinateType === 'point') {
      if (latitude && longitude) {
        setFormData(prev => ({
          ...prev,
          coordenadas: {
            type: 'point',
            coordinates: {
              lat: parseFloat(latitude),
              lng: parseFloat(longitude)
            }
          }
        }));
      }
    } else {
      // For polygon, convert the points array to coordinates
      if (polygonPoints.length > 0) {
        setFormData(prev => ({
          ...prev,
          coordenadas: {
            type: 'polygon',
            coordinates: polygonPoints.map(point => ({
              lat: parseFloat(point.lat),
              lng: parseFloat(point.lng)
            }))
          }
        }));
      }
    }
  };

  const addPolygonPoint = () => {
    if (latitude && longitude) {
      setPolygonPoints(prev => [...prev, { lat: latitude, lng: longitude }]);
      setLatitude('');
      setLongitude('');
    }
  };

  const removePolygonPoint = (index: number) => {
    setPolygonPoints(prev => prev.filter((_, i) => i !== index));
  };

  const clearCoordinates = () => {
    setFormData(prev => ({ ...prev, coordenadas: null }));
    setLatitude('');
    setLongitude('');
    setPolygonPoints([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {zonaParam ? 'Editar Zona' : 'Crear Zona'}
        </Text>
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

      {/* Form Section - Fixed at top */}
      <View style={styles.formSection}>
        <ScrollView style={styles.formScroll}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
              placeholder="Escribe el nombre de la zona"
              placeholderTextColor="#6b7280"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Área (m²)</Text>
            <TextInput
              style={styles.input}
              value={formData.areaMetrosCuadrados}
              onChangeText={(text) => setFormData(prev => ({ ...prev, areaMetrosCuadrados: text }))}
              placeholder="Área en metros cuadrados"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tipo de ubicación</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.typeButton, coordinateType === 'point' && styles.typeButtonActive]}
                onPress={() => setCoordinateType('point')}
              >
                <Text style={[styles.typeButtonText, coordinateType === 'point' && styles.typeButtonTextActive]}>
                  Punto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, coordinateType === 'polygon' && styles.typeButtonActive]}
                onPress={() => setCoordinateType('polygon')}
              >
                <Text style={[styles.typeButtonText, coordinateType === 'polygon' && styles.typeButtonTextActive]}>
                  Lote
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {coordinateType === 'point' ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Coordenadas del Punto</Text>
              <View style={styles.coordinateInputs}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Latitud</Text>
                  <TextInput
                    style={styles.input}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="-1.8539"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Longitud</Text>
                  <TextInput
                    style={styles.input}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="-76.0508"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleCoordinatesChange}
              >
                <Text style={styles.addButtonText}>Establecer Punto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Puntos del Lote</Text>
              <View style={styles.coordinateInputs}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Latitud</Text>
                  <TextInput
                    style={styles.input}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="-1.8539"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Longitud</Text>
                  <TextInput
                    style={styles.input}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="-76.0508"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addPolygonPoint}
              >
                <Text style={styles.addButtonText}>Agregar Punto</Text>
              </TouchableOpacity>

              {polygonPoints.length > 0 && (
                <View style={styles.pointsList}>
                  <Text style={styles.pointsTitle}>Puntos agregados:</Text>
                  {polygonPoints.map((point, index) => (
                    <View key={index} style={styles.pointItem}>
                      <Text style={styles.pointText}>
                        Punto {index + 1}: {point.lat}, {point.lng}
                      </Text>
                      <TouchableOpacity
                        style={styles.removePointButton}
                        onPress={() => removePolygonPoint(index)}
                      >
                        <Text style={styles.removePointText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.savePolygonButton}
                    onPress={handleCoordinatesChange}
                  >
                    <Text style={styles.savePolygonButtonText}>Guardar Lote</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCoordinates}
            >
              <Text style={styles.clearButtonText}>Limpiar Coordenadas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Coordinates Display Section */}
      {formData.coordenadas && (
        <View style={styles.coordinatesSection}>
          <Text style={styles.sectionTitle}>Coordenadas Configuradas</Text>
          {formData.coordenadas.type === 'point' ? (
            <View style={styles.coordinateDisplay}>
              <Text style={styles.coordinateText}>
                Punto: {formData.coordenadas.coordinates.lat}, {formData.coordenadas.coordinates.lng}
              </Text>
            </View>
          ) : (
            <View style={styles.coordinateDisplay}>
              <Text style={styles.coordinateText}>Lote con {formData.coordenadas.coordinates.length} puntos:</Text>
              {formData.coordenadas.coordinates.map((coord: any, index: number) => (
                <Text key={index} style={styles.polygonPointText}>
                  Punto {index + 1}: {coord.lat}, {coord.lng}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#066839',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 45,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  formScroll: {
    maxHeight: 200,
  },
  formSection: {
    maxHeight: 250,
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#ffffff',
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
    margin: 16,
    marginTop: 8,
  },
  mapControls: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mapControlButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  coordinateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsList: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  pointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pointText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  removePointButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removePointText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savePolygonButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  savePolygonButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  coordinatesSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordinateDisplay: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  coordinateText: {
    fontSize: 14,
    color: '#075985',
    fontWeight: '600',
  },
  polygonPointText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    marginTop: 4,
  },
  clearButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
});

export default ZonaPage;