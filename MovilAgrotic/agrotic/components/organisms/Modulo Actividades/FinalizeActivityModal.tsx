import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import CampoTexto from '../../atoms/CampoTexto';
import Boton from '../../atoms/Boton';
import CustomAlertModal from '../../molecules/CustomAlertModal';
import apiClient from '../../../services/General/axios/axios';
import UpdateEstadoFenologicoModal from '../Modulo Cultivos/UpdateEstadoFenologicoModal';
import UpdateCantidadPlantasModal from '../Modulo Cultivos/UpdateCantidadPlantasModal';

interface Actividad {
  id: string;
  descripcion: string;
  fkCategoriaActividadId: string;
  categoriaActividad?: {
    nombre: string;
  };
  reservas?: any[];
  imgUrl?: string;
}

interface FinalizeActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  actividad: Actividad | null;
  cultivo: any;
  onSave: (data: any) => void;
}

const FinalizeActivityModal: React.FC<FinalizeActivityModalProps> = ({
  isVisible,
  onClose,
  actividad,
  cultivo,
  onSave,
}) => {
  const [returnedQuantities, setReturnedQuantities] = useState<{ [key: string]: number }>({});
  const [horas, setHoras] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [observacion, setObservacion] = useState('');
  const [estados, setEstados] = useState<any[]>([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [cantidadPlantas, setCantidadPlantas] = useState('');
  const [evidencia, setEvidencia] = useState<any>(null);
  const [evidenciaNombre, setEvidenciaNombre] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [isUpdateEstadoModalOpen, setIsUpdateEstadoModalOpen] = useState(false);
  const [isUpdateCantidadModalOpen, setIsUpdateCantidadModalOpen] = useState(false);
  const [categoriaNombre, setCategoriaNombre] = useState<string | null>(null);
  const [loadingCategoria, setLoadingCategoria] = useState(false);

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
    if (isVisible && actividad) {
      setReturnedQuantities({});
      setHoras('');
      setPrecioHora('');
      setObservacion('');
      setEvidencia(null);
      setEvidenciaNombre('');
      setSelectedEstadoId(null);
      setCantidadPlantas('');
      setErrors({});
      setIsCameraOpen(false);
      setIsUpdateEstadoModalOpen(false);
      setIsUpdateCantidadModalOpen(false);
      setCategoriaNombre(null);
      loadCategoria();
    }
  }, [isVisible, actividad]);

  const loadCategoria = async () => {
    if (!actividad?.fkCategoriaActividadId) return;

    setLoadingCategoria(true);
    try {
      const response = await apiClient.get(`/categoria-actividad/${actividad.fkCategoriaActividadId}`);
      const categoriaData = response.data;
      setCategoriaNombre(categoriaData.nombre);
      console.log('Categoria loaded:', categoriaData.nombre);
      if (categoriaData.nombre.toLowerCase() === 'observación') {
        loadEstados();
      }
    } catch (error) {
      console.error('Error loading categoria:', error);
    } finally {
      setLoadingCategoria(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const loadEstados = async () => {
    try {
      const response = await apiClient.get('/estados-fenologicos');
      setEstados(response.data);
    } catch (error) {
      console.error('Error loading estados fenológicos:', error);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current && hasPermission) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setEvidencia(photo.uri);
        setEvidenciaNombre('foto_capturada.jpg');
        setIsCameraOpen(false);
      } catch (error) {
        console.error('Error taking photo:', error);
        showAlert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  const openCamera = () => {
    if (hasPermission) {
      setIsCameraOpen(true);
    } else {
      showAlert('Permiso denegado', 'Se necesita permiso para acceder a la cámara');
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    const horasNum = parseFloat(horas);
    const precioNum = parseFloat(precioHora);

    if (!horas || horasNum <= 0) {
      newErrors.horas = 'Horas dedicadas es requerido';
    }
    if (!precioHora || isNaN(precioNum) || precioNum <= 0) {
      newErrors.precioHora = 'Precio por hora es requerido';
    }
    if (!observacion.trim()) {
      newErrors.observacion = 'La observación es requerida';
    }
    if (!evidencia) {
      newErrors.evidencia = 'La evidencia es requerida';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const reservas = actividad?.reservas?.map(reserva => ({
      reservaId: reserva.id,
      cantidadDevuelta: returnedQuantities[reserva.id] || 0,
    })) || [];

    const data = {
      actividadId: actividad!.id,
      reservas,
      horas: horasNum,
      precioHora: precioNum,
      observacion,
    };
    onSave(data);
    onClose();
  };

  if (!actividad) return null;

  console.log('Finalizing activity:', actividad?.categoriaActividad?.nombre);

  return (
    <>
      {isCameraOpen ? (
        <Modal visible={isCameraOpen} transparent animationType="slide" onRequestClose={() => setIsCameraOpen(false)}>
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} ref={cameraRef}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cameraButton} onPress={() => setIsCameraOpen(false)}>
                  <Text style={styles.cameraButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                  <Text style={styles.cameraButtonText}>Tomar Foto</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        </Modal>
      ) : (
        <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Finalizar actividad</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {loadingCategoria ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#22c55e" />
                  <Text style={styles.loadingText}>Cargando detalles de la actividad...</Text>
                </View>
              ) : (
                <>
                  {/* Reservas realizadas */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reservas realizadas (Opcional)</Text>
                <Text style={styles.optionalText}>Indique las cantidades que va a devolver de los productos reservados</Text>
                <ScrollView style={styles.reservasList}>
                  {actividad?.reservas?.map((reserva) => (
                    <View key={reserva.id} style={styles.reservaItem}>
                      <Text style={styles.reservaText}>
                        <Text style={styles.boldText}>{reserva.lote.producto.nombre}</Text>
                      </Text>
                      <Text style={styles.reservaText}>
                        Reservado: {reserva.cantidadReservada} {reserva.lote.producto.unidadMedida.abreviatura}
                      </Text>
                      <CampoTexto
                        etiqueta="Devolver"
                        valor={returnedQuantities[reserva.id]?.toString() || ''}
                        alCambiar={(value) => setReturnedQuantities({ ...returnedQuantities, [reserva.id]: Number(value) || 0 })}
                        tipo="number"
                        marcador="0"
                      />
                    </View>
                  )) || <Text style={styles.emptyText}>No hay reservas</Text>}
                </ScrollView>
              </View>

              {/* Información de finalización */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información de finalización</Text>
                <View style={styles.finalizationGrid}>
                  <View style={styles.finalizationItem}>
                    <CampoTexto
                      etiqueta="Horas dedicadas *"
                      valor={horas}
                      alCambiar={setHoras}
                      tipo="number"
                      marcador="Ej: 8"
                    />
                    {errors.horas && <Text style={styles.errorText}>{errors.horas}</Text>}
                  </View>
                  <View style={styles.finalizationItem}>
                    <CampoTexto
                      etiqueta="Precio por hora *"
                      valor={precioHora}
                      alCambiar={setPrecioHora}
                      tipo="number"
                      marcador="Ej: 15000"
                    />
                    {errors.precioHora && <Text style={styles.errorText}>{errors.precioHora}</Text>}
                  </View>
                </View>
              </View>

              {/* Botones de actualización para observación */}
              {(categoriaNombre?.toLowerCase() === 'observación' || actividad?.categoriaActividad?.nombre?.toLowerCase() === 'observación') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Actualización de Cultivo</Text>
                  <View style={styles.updateButtons}>
                    <Boton
                      label="Actualizar Estado Fenológico"
                      onClick={() => setIsUpdateEstadoModalOpen(true)}
                      variant="bordered"
                      color="primary"
                    />
                    <Boton
                      label="Actualizar Cantidad de Plantas"
                      onClick={() => setIsUpdateCantidadModalOpen(true)}
                      variant="bordered"
                      color="primary"
                    />
                  </View>
                </View>
              )}

              {/* Observación y Evidencia */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Observación y Evidencia</Text>
                <CampoTexto
                  etiqueta="Observación *"
                  valor={observacion}
                  alCambiar={setObservacion}
                  marcador="Observaciones adicionales..."
                  multiline
                />
                {errors.observacion && <Text style={styles.errorText}>{errors.observacion}</Text>}

                <TouchableOpacity style={styles.fileInput} onPress={openCamera}>
                  <Text style={styles.fileInputText}>
                    {evidenciaNombre || 'Tomar Foto de Evidencia'}
                  </Text>
                </TouchableOpacity>
                {errors.evidencia && <Text style={styles.errorText}>{errors.evidencia}</Text>}
              </View>

              <View style={styles.actions}>
                <Boton label="Finalizar Actividad" onClick={handleSave} variant="solid" />
              </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    )}

    {/* Update Estado Fenológico Modal */}
    <UpdateEstadoFenologicoModal
      isOpen={isUpdateEstadoModalOpen}
      onClose={() => setIsUpdateEstadoModalOpen(false)}
      cultivo={cultivo}
      onSuccess={() => setIsUpdateEstadoModalOpen(false)}
    />

    {/* Update Cantidad Plantas Modal */}
    <UpdateCantidadPlantasModal
      isOpen={isUpdateCantidadModalOpen}
      onClose={() => setIsUpdateCantidadModalOpen(false)}
      cultivo={cultivo}
      onSuccess={() => setIsUpdateCantidadModalOpen(false)}
    />

    <CustomAlertModal
      isVisible={alertVisible}
      title={alertTitle}
      message={alertMessage}
      buttons={alertButtons}
      onBackdropPress={() => setAlertVisible(false)}
    />
  </>
);
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
  },
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
    height: '90%',
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  reservasList: {
    maxHeight: 120,
  },
  reservaItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  reservaText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    padding: 10,
  },
  finalizationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  finalizationItem: {
    flex: 1,
  },
  updateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  fileInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#f9fafb',
  },
  fileInputText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  optionalText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
});

export default FinalizeActivityModal;