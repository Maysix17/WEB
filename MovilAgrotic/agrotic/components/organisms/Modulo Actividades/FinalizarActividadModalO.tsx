import React, { useState, useEffect , useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import Boton from '../../atoms/Boton';
import { finalizarActividad, getReservationsByActivity } from '../../../services/Modulo Actividades/actividadesService';
import type { Actividad, Reservation } from '../../../types/Modulo Actividades/Actividades.types';
import UpdateEstadoFenologicoModal from '../Modulo Cultivos/UpdateEstadoFenologicoModal';
import UpdateCantidadPlantasModal from '../Modulo Cultivos/UpdateCantidadPlantasModal';
import CustomAlertModal from '../../molecules/CustomAlertModal';
import { usePermission } from '../../../contexts/PermissionContext';

interface FinalizarActividadModalProps {
  isVisible: boolean;
  onClose: () => void;
  actividad: Actividad | null;
  onActivityFinalized: () => void;
}

const FinalizarActividadModalO: React.FC<FinalizarActividadModalProps> = ({
  isVisible,
  onClose,
  actividad,
  onActivityFinalized,
}) => {
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [observacion, setObservacion] = useState('');
  const [horas, setHoras] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [returns, setReturns] = useState<{ [key: string]: string }>({});
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isUpdateEstadoModalVisible, setIsUpdateEstadoModalVisible] = useState(false);
  const [isUpdatePlantasModalVisible, setIsUpdatePlantasModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  useEffect(() => {
    if (isVisible && actividad) {
      loadReservations();
      resetForm();
    }
  }, [isVisible, actividad]);

  const loadReservations = async () => {
    if (!actividad) return;

    setLoadingReservations(true);
    try {
      const data = await getReservationsByActivity(actividad.id);
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleCameraPress = () => {
    console.log('Camera press - permission:', permission);
    if (!permission) {
      console.log('Camera permissions are still loading');
      showAlert('Cargando', 'Cargando permisos de cámara...');
      return;
    }

    if (!permission.granted) {
      console.log('Camera permissions not granted, requesting...');
      showAlert('Permiso requerido', 'Necesitamos tu permiso para mostrar la cámara');
      requestPermission();
      return;
    }
    console.log('Opening camera');
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        setSelectedImage({
          uri: photo.uri,
          fileName: `activity_${actividad?.id}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        showAlert('Error', 'Error al tomar la foto');
      }
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleFinalize = async () => {
    if (!actividad) return;

    // Validación obligatoria: Todos los campos deben tener valores reales
    // Solo la devolución de productos, actualizar estado fenológico y cantidad de plantas son opcionales
    // NOTA: La devolución de productos es completamente opcional - no se valida si no se ingresa nada
    if (!observacion.trim()) {
      showAlert('Error', 'La observación es obligatoria');
      return;
    }

    const horasNum = parseFloat(horas);
    if (!horas || isNaN(horasNum) || horasNum <= 0) {
      showAlert('Error', 'Debe ingresar horas dedicadas válidas (número mayor a 0)');
      return;
    }

    const precioNum = parseFloat(precioHora);
    if (!precioHora || isNaN(precioNum) || precioNum <= 0) {
      showAlert('Error', 'Debe ingresar precio por hora válido (número mayor a 0)');
      return;
    }

    if (!selectedImage) {
      showAlert('Error', 'Debe tomar una foto como evidencia para finalizar la actividad');
      return;
    }

    // Validar devoluciones de insumos: no pueden devolver valores negativos ni más de lo reservado
    for (const [reservaId, qtyStr] of Object.entries(returns)) {
      if (qtyStr && qtyStr.trim() !== '') {
        const qty = parseFloat(qtyStr);
        if (isNaN(qty) || qty < 0) {
          const reserva = reservations.find(r => r.id === reservaId);
          showAlert('Error', `La cantidad a devolver del producto ${reserva?.lote?.producto?.nombre || 'desconocido'} debe ser un número no negativo`);
          return;
        }
        const reserva = reservations.find(r => r.id === reservaId);
        if (reserva && qty > reserva.cantidadReservada) {
          showAlert('Error', `No puede devolver más de ${reserva.cantidadReservada} ${reserva.lote?.producto?.unidadMedida?.abreviatura || 'u'} del producto ${reserva.lote?.producto?.nombre}`);
          return;
        }
      }
    }

    setIsLoading(true);
   try {
     let imageData: any = undefined;
     if (selectedImage && selectedImage.uri) {
       const imageUri = selectedImage.uri;
       const filename = selectedImage.fileName || `activity_${actividad.id}_${Date.now()}.jpg`;
       const type = selectedImage.type || 'image/jpeg';

       // For React Native, we need to handle the file differently
       imageData = {
         uri: imageUri,
         name: filename,
         type: type,
       };
     }

     // Collect reservas with cantidadDevuelta
     const reservas = Object.entries(returns)
       .filter(([_, qty]) => qty && parseFloat(qty) > 0)
       .map(([reservaId, qty]) => ({
         reservaId,
         cantidadDevuelta: parseFloat(qty),
       }));

     await finalizarActividad(actividad.id, {
       observacion: observacion || undefined,
       imgUrl: imageData,
       horas: horas ? parseFloat(horas) : undefined,
       precioHora: precioHora ? parseFloat(precioHora) : undefined,
       reservas,
     });

     onActivityFinalized();
     onClose();
     resetForm();
   } catch (error) {
     console.error('Error finalizing activity:', error);
     showAlert('Error', 'Error al finalizar la actividad');
   } finally {
     setIsLoading(false);
   }
 };

  const resetForm = () => {
    setObservacion('');
    setHoras('');
    setPrecioHora('');
    setSelectedImage(null);
    setShowCamera(false);
    setReturns({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isObservacionActivity = () => {
    return actividad?.categoriaActividad?.nombre?.toLowerCase().includes('observación') ||
            actividad?.categoriaActividad?.nombre?.toLowerCase().includes('observacion');
  };

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  return (
    <>
      {/* Camera Full Screen Modal */}
      <Modal
        visible={showCamera}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraFullScreen}>
          {permission === null ? (
            <View style={styles.cameraLoading}>
              <Text>Cargando permisos...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.cameraLoading}>
              <Text style={styles.message}>Necesitamos tu permiso para mostrar la cámara</Text>
              <TouchableOpacity style={styles.button} onPress={requestPermission}>
                <Text style={styles.buttonText}>Conceder permiso</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView ref={cameraRef} style={styles.cameraFull} facing={facing} />
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <Text style={styles.captureButtonText}>📷</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                  <Text style={styles.flipButtonText}>Girar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCamera(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Main Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Finalizar Actividad</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {actividad && (
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{actividad.descripcion}</Text>
                <Text style={styles.activityDate}>
                  Fecha: {(() => {
                    const dateStr = actividad.fechaAsignacion;
                    if (typeof dateStr === 'string' && dateStr.includes('T')) {
                      const date = new Date(dateStr);
                      return date.toLocaleDateString('es-CO', {
                        timeZone: 'America/Bogota',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      });
                    } else {
                      const [year, month, day] = dateStr.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      });
                    }
                  })()}
                </Text>
                <Text style={styles.activityCrop}>
                  Tipo de Cultivo: {actividad.cultivoVariedadZona?.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'No especificado'}
                </Text>
                <Text style={styles.activityVariety}>
                  Variedad: {actividad.cultivoVariedadZona?.cultivoXVariedad?.variedad?.nombre || 'No especificado'}
                </Text>
                <Text style={styles.activityZone}>
                  Zona: {actividad.cultivoVariedadZona?.zona?.nombre || 'No especificado'}
                </Text>
              </View>
            )}

            {/* Reservas realizadas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Devolución de Productos</Text>
              <Text style={styles.optionalText}>
                (Opcional) Indique las cantidades que va a devolver de los productos reservados
              </Text>
              {loadingReservations ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : reservations.length === 0 ? (
                <Text style={styles.noReservationsText}>No hay reservas para esta actividad</Text>
              ) : (
                <FlatList
                  data={reservations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.reservationItem}>
                      <View style={styles.reservationInfo}>
                        <Text style={styles.reservationName}>
                          {item.lote?.producto?.nombre || 'Producto sin nombre'}
                        </Text>
                        <Text style={styles.reservationQty}>
                          Reservado: {item.cantidadReservada} {item.lote?.producto?.unidadMedida?.abreviatura || 'u'}
                        </Text>
                      </View>
                      <View style={styles.returnSection}>
                        <TextInput
                          style={styles.returnInput}
                          value={returns[item.id] || ''}
                          onChangeText={(value) => {
                            // Reemplazar , con . para permitir separador decimal español
                            const normalizedValue = value.replace(',', '.');
                            // Permitir decimales solo para productos divisibles (semillas, pesticidas, etc.)
                            // Para herramientas, solo enteros
                            const esDivisible = item.lote?.producto?.categoria?.esDivisible ?? true;
                            let regex;
                            if (esDivisible) {
                              // Permitir decimales: números enteros o con punto decimal (no iniciar con .)
                              regex = /^\d+\.?\d*$/;
                            } else {
                              // Solo enteros para herramientas
                              regex = /^\d+$/;
                            }
                            if (regex.test(normalizedValue) || normalizedValue === '') {
                              setReturns({ ...returns, [item.id]: normalizedValue });
                            }
                          }}
                          placeholder="Devolver"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                />
              )}
            </View>

            {/* Información de finalización */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Obligatoria de Finalización</Text>

              <View style={styles.formSection}>
                <Text style={styles.label}>Horas dedicadas *</Text>
                <TextInput
                  style={styles.textInput}
                  value={horas}
                  onChangeText={(value) => {
                    // Reemplazar , con . para permitir separador decimal español
                    const normalizedValue = value.replace(',', '.');
                    // Solo permitir números válidos (no iniciar con .)
                    if (/^\d+\.?\d*$/.test(normalizedValue) || normalizedValue === '') {
                      setHoras(normalizedValue);
                    }
                  }}
                  placeholder="Ej: 8"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Precio por hora *</Text>
                <TextInput
                  style={styles.textInput}
                  value={precioHora}
                  onChangeText={(value) => {
                    // Reemplazar , con . para permitir separador decimal español
                    const normalizedValue = value.replace(',', '.');
                    // Solo permitir números válidos (no iniciar con .)
                    if (/^\d+\.?\d*$/.test(normalizedValue) || normalizedValue === '') {
                      setPrecioHora(normalizedValue);
                    }
                  }}
                  placeholder="Ej: 15000"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Actualizaciones opcionales para actividades de observación */}
            {isObservacionActivity() && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actualizaciones Opcionales (Observación)</Text>
                <Text style={styles.optionalText}>
                  Estas actualizaciones son opcionales y se aplicarán al cultivo al finalizar la actividad.
                </Text>

                <View style={styles.optionalButtonsContainer}>
                  <TouchableOpacity
                    style={styles.optionalButton}
                    onPress={() => setIsUpdateEstadoModalVisible(true)}
                  >
                    <Text style={styles.optionalButtonText}>Actualizar Estado Fenológico</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionalButton}
                    onPress={() => setIsUpdatePlantasModalVisible(true)}
                  >
                    <Text style={styles.optionalButtonText}>Actualizar Cantidad de Plantas</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Observación y Evidencia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observación y Evidencia</Text>

              <View style={styles.formSection}>
                <Text style={styles.label}>Observación *</Text>
                <TextInput
                  style={styles.textInput}
                  value={observacion}
                  onChangeText={setObservacion}
                  placeholder="Observaciones adicionales..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Evidencia Fotográfica</Text>
                <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
                  <Text style={styles.cameraButtonText}>
                    {selectedImage ? `✓ ${selectedImage.fileName || 'Imagen seleccionada'}` : ' Abrir Cámara'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                {!isInitializing && hasPermission('Actividades', 'actividades', 'actualizar') && (
                  <Boton
                    text={isLoading ? "Finalizando..." : "Finalizar"}
                    onClick={handleFinalize}
                    disabled={isLoading}
                    color="danger"
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Update Estado Fenológico Modal */}
      <UpdateEstadoFenologicoModal
        isOpen={isUpdateEstadoModalVisible}
        onClose={() => setIsUpdateEstadoModalVisible(false)}
        cultivo={actividad ? {
          cvzid: actividad.fkCultivoVariedadZonaId || '',
          nombrecultivo: actividad.cultivoVariedadZona?.cultivoXVariedad?.variedad?.nombre || '',
          ficha: actividad.cultivoVariedadZona?.cultivoXVariedad?.cultivo?.ficha?.numero || '',
          estado_fenologico_nombre: '',
        } as any : null}
        onSuccess={() => {
          setIsUpdateEstadoModalVisible(false);
          showAlert('Éxito', 'Estado fenológico actualizado correctamente');
        }}
      />

      {/* Update Cantidad Plantas Modal */}
      <UpdateCantidadPlantasModal
        isOpen={isUpdatePlantasModalVisible}
        onClose={() => setIsUpdatePlantasModalVisible(false)}
        cultivo={actividad ? {
          cvzid: actividad.fkCultivoVariedadZonaId || '',
          nombrecultivo: actividad.cultivoVariedadZona?.cultivoXVariedad?.variedad?.nombre || '',
          ficha: actividad.cultivoVariedadZona?.cultivoXVariedad?.cultivo?.ficha?.numero || '',
        } as any : null}
        onSuccess={() => {
          setIsUpdatePlantasModalVisible(false);
          showAlert('Éxito', 'Cantidad de plantas actualizada correctamente');
        }}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </Modal>
    </>
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
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  activityInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityCrop: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginTop: 4,
  },
  activityVariety: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginTop: 2,
  },
  activityZone: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginTop: 2,
  },
  formSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cameraButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  noReservationsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    padding: 16,
  },
  reservationItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reservationInfo: {
    marginBottom: 8,
  },
  returnSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  returnInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    width: 80,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reservationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  reservationQty: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 12,
  },
  returnButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  returnButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    padding: 16,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  captureButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  flipButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  optionalText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionalButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  optionalButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  cameraFullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFull: {
    flex: 1,
  },
  cameraLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default FinalizarActividadModalO;