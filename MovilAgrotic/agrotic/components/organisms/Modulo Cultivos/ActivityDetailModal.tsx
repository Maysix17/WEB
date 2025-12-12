import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Constants from 'expo-constants';
import Boton from '../../atoms/Boton';
import { getReservationsByActivity, getActividadesByCultivoVariedadZonaId } from '../../../services/Modulo Actividades/actividadesService';
import apiClient from '../../../services/General/axios/axios';

interface Reservation {
  id: string;
  cantidadReservada: number;
  cantidadUsada?: number;
  precioProducto?: number;
  capacidadPresentacionProducto?: number;
  lote?: {
    nombre: string;
    producto: {
      nombre: string;
      precioProducto?: number;
      capacidadPresentacionProducto?: number;
      unidadMedida?: { abreviatura: string };
      categoria?: { esDivisible: boolean };
      vidaUtilPromedioPorUsos?: number;
    };
  };
  estado?: { nombre: string };
}

interface Activity {
  id: string;
  descripcion: string;
  fechaAsignacion: string;
  horasDedicadas?: number;
  precioHora?: number;
  observacion?: string;
  categoriaActividad?: { nombre: string };
  cultivoVariedadZona?: {
    zona?: { nombre: string };
    cultivoXVariedad?: {
      cultivo?: { nombre: string; ficha?: { numero: string } };
      variedad?: { nombre: string; tipoCultivo?: { nombre: string } };
    };
  };
  usuariosAsignados?: { usuario: { dni: number; nombres: string; apellidos: string; ficha?: { numero: number } }; activo: boolean }[];
  inventarioUsado?: { inventario: { nombre: string; id: string; categoria: { nombre: string } }; cantidadUsada: number; activo: boolean }[];
  reservations?: Reservation[];
  dniResponsable?: number;
  responsableNombre?: string;
  responsableDni?: number;
  imgUrl?: string;
}

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  cultivo?: any;
  onFinalize?: () => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = React.memo(({
  isOpen,
  onClose,
  activity,
  cultivo,
  onFinalize,
}) => {
  console.log('ActivityDetailModal render - isOpen:', isOpen, 'activity:', activity);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullActivity, setFullActivity] = useState<Activity | null>(null);
  const [categoria, setCategoria] = useState<any>(null);
  const [responsibleName, setResponsibleName] = useState<string>('');

  useEffect(() => {
    if (activity && isOpen) {
      console.log('ActivityDetailModal opened');
      try {
        fetchFullActivityData();
      } catch (error) {
        console.error('Error in ActivityDetailModal useEffect:', error);
        Alert.alert('Error', 'Ocurrió un error al cargar los detalles de la actividad');
        onClose();
      }
    }
  }, [activity, isOpen]);

  const fetchFullActivityData = async () => {
    if (!activity) return;
    setLoading(true);
    try {
      // Fetch updated activity data to get latest imgUrl and other fields
      const activityRes = await apiClient.get(`/actividades/${activity.id}`);
      const updatedActivity = activityRes.data;

      // Fetch reservations
      const res = await getReservationsByActivity(activity.id);
      setReservations(res);

      // Fetch responsible user if dniResponsable and nombreResponsable is empty or default
      if (updatedActivity.dniResponsable && (!(updatedActivity as any).nombreResponsable || (updatedActivity as any).nombreResponsable === 'Sin responsable')) {
        try {
          const userRes = await apiClient.get(`/usuarios/search/dni/${updatedActivity.dniResponsable}`);
          const userData = Array.isArray(userRes.data) ? userRes.data[0] : userRes.data;
          if (userData) {
            setResponsibleName(`${userData.nombres} ${userData.apellidos}`);
          }
        } catch (error) {
          console.error('Error fetching responsible user:', error);
        }
      }

      // Fetch categoria if not available
      if (updatedActivity.categoriaActividad?.nombre) {
        setCategoria(updatedActivity.categoriaActividad);
      } else if ((updatedActivity as any).fkCategoriaActividadId) {
        try {
          const catRes = await apiClient.get(`/categoria-actividad/${(updatedActivity as any).fkCategoriaActividadId}`);
          setCategoria(catRes.data);
        } catch (error) {
          console.error('Error fetching categoria:', error);
        }
      }

      // Merge with original activity to keep relations like usuariosAsignados
      setFullActivity({ ...updatedActivity, usuariosAsignados: activity.usuariosAsignados, responsableNombre: (updatedActivity as any).responsableNombre || (activity as any).responsableNombre });
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setFullActivity(activity);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const getUbicacion = () => {
    if (!cultivo) return 'Ubicación no disponible';
    const tipoCultivoName = cultivo.tipo_cultivo_nombre || 'Tipo Cultivo';
    const variedadName = cultivo.nombrecultivo || 'Variedad';
    const zoneName = cultivo.lote || 'Zona';
    return `${tipoCultivoName} - ${variedadName} - ${zoneName}`;
  };

  const calculateCostoManoObra = (activity: Activity) => {
    const horas = parseFloat((activity as any).horasDedicadas) || 0;
    const precio = (activity as any).precioHora || 0; // Use real data
    return horas * precio;
  };

  const calculateCostoInventario = () => {
    // Usar EXACTAMENTE la lógica del backend calculateActivityCosts
    // Usar las reservations del estado, no del activity
    return reservations.reduce((total, reserva) => {
      const cantidadUsada = reserva.cantidadUsada || 0;
      let unitPrice = 0;
      let subtotal = 0;

      // Verificar si el producto es divisible (consumible) o no (herramienta)
      const esDivisible = reserva.lote?.producto?.categoria?.esDivisible ?? true; // Default true para compatibilidad

      if (esDivisible) {
        // Lógica para productos divisibles (consumibles)
        const capacidad = reserva.capacidadPresentacionProducto || 1;
        const precio = reserva.precioProducto || 0;
        unitPrice = capacidad > 0 ? precio / capacidad : 0;
        subtotal = cantidadUsada * unitPrice;
      } else {
        // Lógica para productos no divisibles (herramientas) - depreciación por uso
        const vidaUtilPromedioPorUsos = reserva.lote?.producto?.vidaUtilPromedioPorUsos;
        const precio = reserva.precioProducto || 0;

        if (vidaUtilPromedioPorUsos && vidaUtilPromedioPorUsos > 0) {
          // Valor residual = 10% del precio del producto
          const valorResidual = precio * 0.1;
          const costoPorUso = (precio - valorResidual) / vidaUtilPromedioPorUsos;

          // Cada uso cuenta como 1 uso
          unitPrice = costoPorUso;
          subtotal = costoPorUso; // cantidadUsada representa número de usos
        } else {
          // Fallback: si no hay vida útil definida, usar lógica normal
          const capacidad = reserva.capacidadPresentacionProducto || 1;
          unitPrice = capacidad > 0 ? precio / capacidad : 0;
          subtotal = cantidadUsada * unitPrice;
        }
      }

      return total + subtotal;
    }, 0);
  };

  const calculateCostoTotalActividad = (activity: Activity) => {
    return calculateCostoManoObra(activity) + calculateCostoInventario();
  };

  const calculateSubtotalReserva = (reserva: Reservation) => {
    const cantidadUsada = reserva.cantidadUsada || 0;
    if (cantidadUsada > 0) {
      const precioProducto = reserva.precioProducto || reserva.lote?.producto?.precioProducto || 0;
      const capacidadPresentacionProducto = reserva.capacidadPresentacionProducto || reserva.lote?.producto?.capacidadPresentacionProducto || 1;
      const esDivisible = reserva.lote?.producto?.categoria?.esDivisible ?? true;
      if (esDivisible) {
        const precioUnitario = precioProducto / capacidadPresentacionProducto;
        return cantidadUsada * precioUnitario;
      } else {
        const vidaUtil = reserva.lote?.producto?.vidaUtilPromedioPorUsos;
        if (vidaUtil && vidaUtil > 0) {
          const valorResidual = precioProducto * 0.1;
          return (precioProducto - valorResidual) / vidaUtil;
        } else {
          const precioUnitario = precioProducto / capacidadPresentacionProducto;
          return cantidadUsada * precioUnitario;
        }
      }
    }
    return 0;
  };

  if (!activity) return null;

  const displayActivity = fullActivity || activity;

  return (
    <Modal visible={isOpen} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Detalles de la Actividad</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Usuario Responsable */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usuario Responsable</Text>
              {responsibleName ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>{responsibleName}</Text>
                  <Text style={styles.infoSubtext}>DNI: {displayActivity.dniResponsable}</Text>
                </View>
              ) : (displayActivity as any).nombreResponsable && (displayActivity as any).nombreResponsable !== 'Sin responsable' ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>{(displayActivity as any).nombreResponsable}</Text>
                  <Text style={styles.infoSubtext}>DNI: {displayActivity.dniResponsable}</Text>
                </View>
              ) : displayActivity.dniResponsable ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>DNI: {displayActivity.dniResponsable}</Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>Sin responsable asignado</Text>
              )}
            </View>

            {/* Usuarios Asignados */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usuarios Asignados</Text>
              {displayActivity.usuariosAsignados?.length ? (
                displayActivity.usuariosAsignados.map((uxa, idx) => (
                  <View key={idx} style={styles.infoCard}>
                    <Text style={styles.infoText}>{uxa.usuario.nombres} {uxa.usuario.apellidos}</Text>
                    <Text style={styles.infoSubtext}>DNI: {uxa.usuario.dni}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No hay usuarios asignados</Text>
              )}
            </View>

            {/* Información de la Actividad */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de la Actividad</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Fecha Asignación</Text>
                  <Text style={styles.value}>
                    {(() => {
                      try {
                        const dateStr = displayActivity.fechaAsignacion;
                        if (typeof dateStr === 'string' && dateStr.includes('T')) {
                          // ISO string with time - use timezone conversion
                          const date = new Date(dateStr);
                          return date.toLocaleDateString('es-CO', {
                            timeZone: 'America/Bogota',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          });
                        } else {
                          // Date-only string (YYYY-MM-DD) - avoid timezone issues
                          const [year, month, day] = dateStr.split('-').map(Number);
                          return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                        }
                      } catch (error) {
                        console.error('Error formatting date:', error);
                        return displayActivity.fechaAsignacion || 'Fecha no disponible';
                      }
                    })()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Estado</Text>
                  <Text style={styles.value}>Finalizada</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Horas Dedicadas</Text>
                  <Text style={styles.value}>{(displayActivity as any).horasDedicadas || 0}h</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Categoría</Text>
                  <Text style={styles.value}>{categoria?.nombre || (displayActivity as any).categoria || 'Sin categoría'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Costo de Mano de Obra</Text>
                  <Text style={styles.value}>
                    ${(() => {
                      try {
                        return calculateCostoManoObra(displayActivity).toFixed(2);
                      } catch (error) {
                        console.error('Error calculating costo mano obra:', error);
                        return '0.00';
                      }
                    })()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Costo Total de la Actividad</Text>
                  <Text style={styles.value}>
                    ${(() => {
                      try {
                        return calculateCostoTotalActividad(displayActivity).toFixed(2);
                      } catch (error) {
                        console.error('Error calculating costo total:', error);
                        return '0.00';
                      }
                    })()}
                  </Text>
                </View>
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Observación</Text>
                <Text style={styles.description}>{displayActivity.observacion || 'Sin observación'}</Text>
              </View>
            </View>

            {/* Reservas de Insumos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reservas de Insumos</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#22c55e" />
              ) : reservations.length ? (
                reservations.map((res, idx) => (
                  <View key={idx} style={styles.reservationCard}>
                    <View style={styles.reservationHeader}>
                      <Text style={styles.reservationTitle}>{res.lote?.producto?.nombre}</Text>
                      <Text style={styles.reservationStatus}>
                        {res.estado?.nombre || 'Pendiente'}
                      </Text>
                    </View>
                    <View style={styles.reservationDetails}>
                      <Text style={styles.reservationInfo}>
                        Reservado: {res.cantidadReservada} {res.lote?.producto?.unidadMedida?.abreviatura}
                      </Text>
                      <Text style={styles.reservationInfo}>
                        Usado: {res.cantidadUsada || 0} {res.lote?.producto?.unidadMedida?.abreviatura}
                      </Text>
                      {/*<Text style={styles.reservationInfo}>
                        Subtotal: ${calculateSubtotalReserva(res).toFixed(2)}
                      </Text>*/}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No hay reservas</Text>
              )}
            </View>

            {/* Imagen de Evidencia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Imagen de Evidencia</Text>
              {(() => {
                try {
                  if (displayActivity?.imgUrl) {
                    const imageUrl = `${Constants.expoConfig?.extra?.apiUrl || 'http://192.168.101.4:3000'}${displayActivity.imgUrl?.replace('/uploads/evidencias/', '/uploads/')}`;
                    return (
                      <View style={styles.imageContainer}>
                        <Text style={styles.imageTitle}>Evidencia de actividad</Text>
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.evidenceImage}
                          resizeMode="contain"
                          onError={(error) => console.error('Image load error:', error)}
                        />
                      </View>
                    );
                  } else {
                    return <Text style={styles.emptyText}>No hay imagen de evidencia</Text>;
                  }
                } catch (error) {
                  console.error('Error rendering image section:', error);
                  return <Text style={styles.emptyText}>Error al cargar imagen</Text>;
                }
              })()}
            </View>

            {/* Categoria de la actividad *
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categoria de la actividad</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{categoria?.nombre || displayActivity.categoriaActividad?.nombre || 'Sin categoría'}</Text>
              </View>
            </View>*/}

            {/* Ubicación del Cultivo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ubicación del Cultivo</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{(displayActivity as any).zona || getUbicacion()}</Text>
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{displayActivity.descripcion}</Text>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

ActivityDetailModal.displayName = 'ActivityDetailModal';

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
    width: '95%',
    maxHeight: '90%',
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
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#111827',
  },
  descriptionContainer: {
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  reservationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  reservationStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusInUse: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusOther: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  reservationDetails: {
    flexDirection: 'column',
    gap: 4,
  },
  reservationInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  evidenceImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
});

export default ActivityDetailModal;