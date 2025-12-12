import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import Constants from 'expo-constants';
import Boton from '../../atoms/Boton';
import CustomAlertModal from '../../molecules/CustomAlertModal';
import type { Actividad } from '../../../types/Modulo Actividades/Actividades.types';
import apiClient from '../../../services/General/axios/axios';
import { getProfile } from '../../../services/Modulo Usuarios/profileService';
import { usePermission } from '../../../contexts/PermissionContext';

interface ActivityDetailModalProps {
   isVisible: boolean;
   onClose: () => void;
   actividad: Actividad | null;
   onFinalize?: () => void;
   onUpdate?: (actividad: Actividad | null) => void;
   onEdit?: (actividad: Actividad | null) => void;
   onDelete?: () => void;
}

const ActivityDetailModalO: React.FC<ActivityDetailModalProps> = ({
   isVisible,
   onClose,
   actividad,
   onFinalize,
   onUpdate,
   onEdit,
   onDelete,
 }) => {
  console.log('ActivityDetailModalO render start');
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [responsable, setResponsable] = useState<any>(null);
  const [usuariosAsignados, setUsuariosAsignados] = useState<any[]>([]);
  const [categoria, setCategoria] = useState<any>(null);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Estado para modal de alertas personalizado
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
    try {
      if (actividad && isVisible) {
        console.log('=== MODAL ACTIVITY DETAIL OPENED ===');
        console.log('Actividad recibida:', JSON.stringify(actividad, null, 2));
        console.log('Actividad ID:', actividad.id);
        console.log('Actividad descripcion:', actividad.descripcion);
        console.log('Actividad estado:', actividad.estado);
        console.log('Actividad dniResponsable:', actividad.dniResponsable);
        console.log('Actividad fkCategoriaActividadId:', actividad.fkCategoriaActividadId);
        console.log('Actividad fkCultivoVariedadZonaId:', (actividad as any).fkCultivoVariedadZonaId);
        console.log('Actividad usuariosAsignados:', actividad.usuariosAsignados);
        console.log('Actividad reservas:', actividad.reservas);
        console.log('=====================================');

        setImageLoading(false);
        setImageError(false);
        fetchAdditionalData();
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [actividad?.id, isVisible]);

  // Detectar cambios en el estado para mostrar datos actualizados
  useEffect(() => {
    if (responsable || categoria || usuariosAsignados.length > 0 || reservas.length > 0) {
      console.log('=== ESTADO ACTUALIZADO ===');
      console.log('Responsable actualizado:', responsable);
      console.log('Categoria actualizada:', categoria);
      console.log('Usuarios asignados actualizados:', usuariosAsignados);
      console.log('Reservas actualizadas:', reservas);
      console.log('===========================');
    }
  }, [responsable, categoria, usuariosAsignados, reservas]);


  const fetchAdditionalData = async () => {
    if (!actividad) return;
    console.log('=== FETCHING ADDITIONAL DATA ===');
    console.log('Actividad ID:', actividad.id);
    console.log('Actividad completa:', JSON.stringify(actividad, null, 2));
    setLoading(true);
    try {
      // Use usuarios asignados from activity data if available, otherwise fetch
      if (actividad.usuariosAsignados && actividad.usuariosAsignados.length > 0) {
        setUsuariosAsignados(actividad.usuariosAsignados);
        console.log("DEBUG: Using usuarios from activity:", actividad.usuariosAsignados);
      } else {
        // Fetch usuarios asignados
        try {
          const urlUsuarios = `/usuarios-x-actividades/actividad/${actividad.id}`;
          console.log("DEBUG: Fetching Usuarios URL:", urlUsuarios);
          const usuariosRes = await apiClient.get(urlUsuarios);
          setUsuariosAsignados(usuariosRes.data || []);
          console.log("DEBUG: Usuarios asignados data:", usuariosRes.data);
        } catch (error) {
          console.log("No usuarios asignados found, setting empty array");
          setUsuariosAsignados([]);
        }
      }

      // Fetch responsable
      if (actividad.dniResponsable) {
        const urlResponsable = `/usuarios/search/dni/${actividad.dniResponsable}`;
        console.log("DEBUG: Fetching Responsable URL:", urlResponsable);
        const userRes = await apiClient.get(urlResponsable);
        //  CORRECCIÓN CLAVE: Si la respuesta es un arreglo, toma el primer elemento.
        const dataResponsable = Array.isArray(userRes.data) ? userRes.data[0] : userRes.data;
        setResponsable(dataResponsable || null);
        console.log("DEBUG: Responsable data:", dataResponsable);
      }

      // Fetch categoria
      if (actividad.fkCategoriaActividadId) {
        try {
          const urlCategoria = `/categoria-actividad/${actividad.fkCategoriaActividadId}`;
          console.log("DEBUG: Fetching Categoria URL:", urlCategoria);
          const catRes = await apiClient.get(urlCategoria);
          setCategoria(catRes.data);
          console.log("DEBUG: Categoria data:", catRes.data);
        } catch (error: any) {
          console.error("Error fetching categoria:", error);
          if (error.response?.status === 403) {
            console.log("DEBUG: No permissions to fetch categoria, using activity data if available");
            // If no permissions, try to use categoria from activity data
            setCategoria(actividad.categoriaActividad || null);
          } else {
            setCategoria(null);
          }
        }
      } else {
        // If no fkCategoriaActividadId, try to use categoria from activity data
        setCategoria(actividad.categoriaActividad || null);
        console.log("DEBUG: No fkCategoriaActividadId, using categoria from activity:", actividad.categoriaActividad);
      }

      // Use cultivoVariedadZona from activity data if available
      console.log("DEBUG: Using Cultivo from activity data:", actividad.cultivoVariedadZona);

      // Use reservas from activity data if available, otherwise fetch
      if (actividad.reservas && actividad.reservas.length > 0) {
        setReservas(actividad.reservas);
        console.log("DEBUG: Using reservas from activity:", actividad.reservas);
      } else {
        // Fetch reservas
        try {
          const urlReservas = `/actividades/${actividad.id}/reservas`;
          console.log("DEBUG: Fetching Reservas URL:", urlReservas);
          const reservasRes = await apiClient.get(urlReservas);
          setReservas(reservasRes.data || []);
          console.log("DEBUG: Reservas data:", reservasRes.data);
        } catch (error: any) {
          console.error("Error fetching reservas:", error);
          if (error.response?.status === 403) {
            console.log("DEBUG: No permissions to fetch reservas, using activity data if available");
            // If no permissions, try to use reservas from activity data or set empty
            setReservas(actividad.reservas || []);
          } else {
            console.log("No reservas found, setting empty array");
            setReservas([]);
          }
        }
      }

      console.log('=== ADDITIONAL DATA FETCHED SUCCESSFULLY ===');
      console.log('Final state - categoria:', categoria);
      console.log('Final state - usuariosAsignados:', usuariosAsignados);
    } catch (error: any) {
      console.error('Error fetching additional data:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };


  // Si no hay actividad, no se renderiza nada
  if (!actividad) return null;

  // Console.log simplificado para render
  if (loading) {
    console.log('Render: Loading activity details...');
  } else {
    console.log('Render: Activity details loaded - Responsable:', responsable?.nombres, '- Categoria:', categoria?.nombre);
    console.log('Render: Usuarios asignados count:', usuariosAsignados?.length || 0);
    console.log('Render: Reservas count:', reservas?.length || 0);
  }

  const calculateCostoManoObra = (activity: Actividad) => {
    // Usar EXACTAMENTE la lógica del backend: horasDedicadas * precioHora
    const horas = (activity as any).horasDedicadas || 0;
    const laborRate = (activity as any).precioHora || 0; // Usar precioHora establecido al finalizar
    return horas * laborRate;
  };


  const calculateDepreciacionInsumos = () => {
    // Usar EXACTAMENTE la misma lógica que el backend calculateActivityCosts
    return reservas.reduce((total, reserva) => {
      const cantidadUsada = reserva.cantidadUsada || 0;
      let unitPrice = 0;
      let subtotal = 0;

      // Verificar si el producto es divisible (consumible) o no (herramienta)
      const esDivisible = reserva.lote?.producto?.categoria?.esDivisible ?? true; // Default true para compatibilidad

      if (esDivisible) {
        // Lógica para productos divisibles (consumibles)
        unitPrice = reserva.capacidadPresentacionProducto > 0
          ? reserva.precioProducto / reserva.capacidadPresentacionProducto
          : 0;
        subtotal = cantidadUsada * unitPrice;
      } else {
        // Lógica para productos no divisibles (herramientas) - depreciación por uso
        const vidaUtilPromedioPorUsos = reserva.lote?.producto?.vidaUtilPromedioPorUsos;

        if (vidaUtilPromedioPorUsos && vidaUtilPromedioPorUsos > 0) {
          // Valor residual = 10% del precio del producto
          const valorResidual = reserva.precioProducto * 0.1;
          const costoPorUso = (reserva.precioProducto - valorResidual) / vidaUtilPromedioPorUsos;

          // Cada uso cuenta como 1 uso
          unitPrice = costoPorUso;
          subtotal = costoPorUso; // cantidadUsada representa número de usos
        } else {
          // Fallback: si no hay vida útil definida, usar lógica normal
          unitPrice = reserva.capacidadPresentacionProducto > 0
            ? reserva.precioProducto / reserva.capacidadPresentacionProducto
            : 0;
          subtotal = cantidadUsada * unitPrice;
        }
      }

      return total + subtotal;
    }, 0);
  };

  const calculateCostoTotalActividad = (activity: Actividad) => {
    // Usar EXACTAMENTE la lógica del backend calculateActivityCosts
    const totalInputsCost = calculateDepreciacionInsumos();
    const laborCost = calculateCostoManoObra(activity);

    // Costo total = Costo insumos + Costo mano de obra (igual que backend)
    const totalActivityCost = totalInputsCost + laborCost;

    console.log('=== CÁLCULO COSTO TOTAL ACTIVIDAD (BACKEND LOGIC) ===');
    console.log('Costo insumos:', totalInputsCost.toFixed(2));
    console.log('Costo mano de obra:', laborCost.toFixed(2));
    console.log('TOTAL:', totalActivityCost.toFixed(2));
    console.log('===================================================');

    return totalActivityCost;
  };


  console.log('=== MODAL RENDER DEBUG ===');
  console.log('Actividad ID:', actividad?.id);
  console.log('Usuarios asignados en actividad:', actividad?.usuariosAsignados?.length || 0);
  console.log('Nombre responsable:', actividad?.nombreResponsable);
  console.log('ImgUrl:', actividad?.imgUrl);
  console.log('Responsable state:', responsable);
  console.log('Permission check - hasPermission eliminar:', hasPermission('Actividades', 'actividades', 'eliminar'));
  console.log('onDelete prop provided:', !!onDelete);
  console.log('===========================');

  const responsibleName = responsable ? `${responsable.nombres || responsable.numero_documento} ${responsable.apellidos || ''}`.trim() : actividad?.nombreResponsable || null;
  const displayActivity = actividad;

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
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
                  <Text style={styles.infoSubtext}>N.Documento: {responsable?.dni || 'No disponible'}</Text>
                </View>
              ) : displayActivity.dniResponsable ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>N.Documento: {displayActivity.dniResponsable}</Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>Sin responsable asignado</Text>
              )}
            </View>

            {/* Usuarios Asignados */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usuarios Asignados</Text>
              {usuariosAsignados?.filter(u => displayActivity.estado || u.activo).length ? (
                usuariosAsignados.filter(u => displayActivity.estado || u.activo).map((uxa, idx) => (
                  <View key={idx} style={styles.infoCard}>
                    <Text style={styles.infoText}>{uxa.usuario.nombres} {uxa.usuario.apellidos}</Text>
                    <Text style={styles.infoSubtext}>N.Documento: {uxa.usuario.dni}</Text>
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
                    })()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Estado</Text>
                  <Text style={styles.value}>{displayActivity.estado ? 'En Progreso' : 'Finalizada'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Categoría</Text>
                  <Text style={styles.value}>{categoria?.nombre || actividad.categoriaActividad?.nombre || (displayActivity as any).categoria || 'Sin categoría'}</Text>
                </View>
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.description}>{displayActivity.descripcion || 'Sin descripción'}</Text>
              </View>
            </View>

            {/* Reservas de Insumos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reservas de Insumos</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#22c55e" />
              ) : reservas && reservas.length > 0 ? (
                reservas.map((res, idx) => (
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

            {/* Costos de Depreciación (solo mostrar si hay reservas finalizadas) */}
            {reservas.some(r => r.cantidadUsada > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Costos de Depreciación</Text>
                <View style={styles.costCard}>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Costo Insumos:</Text>
                    <Text style={styles.costValue}>${calculateDepreciacionInsumos().toFixed(2)}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Costo Mano de Obra:</Text>
                    <Text style={styles.costValue}>${calculateCostoManoObra(actividad).toFixed(2)}</Text>
                  </View>
                  <View style={[styles.costRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Costo Total Actividad:</Text>
                    <Text style={styles.totalValue}>${calculateCostoTotalActividad(actividad).toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Ubicación del Cultivo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ubicación del Cultivo</Text>
              <View style={styles.locationCard}>
                {(() => {
                  const cvz = actividad.cultivoVariedadZona;
                  if (cvz) {
                    const tipoCultivo = cvz.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'No especificado';
                    const variedad = cvz.cultivoXVariedad?.variedad?.nombre || 'No especificada';
                    const zona = cvz.zona?.nombre || 'No especificada';

                    return (
                      <>
                        <View style={styles.locationRow}>
                          <Text style={styles.locationLabel}>Tipo de Cultivo:</Text>
                          <Text style={styles.locationValue}>{tipoCultivo}</Text>
                        </View>
                        <View style={styles.locationRow}>
                          <Text style={styles.locationLabel}>Variedad:</Text>
                          <Text style={styles.locationValue}>{variedad}</Text>
                        </View>
                        <View style={styles.locationRow}>
                          <Text style={styles.locationLabel}>Zona:</Text>
                          <Text style={styles.locationValue}>{zona}</Text>
                        </View>
                      </>
                    );
                  } else {
                    return (
                      <Text style={styles.emptyText}>Sin ubicación especificada</Text>
                    );
                  }
                })()}
              </View>
            </View>

            {/* Imagen de Evidencia */}
            {actividad.imgUrl && (
              <View style={styles.section}>
                <Text style={styles.imageTitle}>📷 Imagen de Evidencia</Text>
                <View style={styles.imageContainer}>
                  {imageLoading && (
                    <View style={styles.imageLoadingContainer}>
                      <ActivityIndicator size="large" color="#22c55e" />
                      <Text style={styles.imageLoadingText}>Cargando imagen...</Text>
                    </View>
                  )}
                  {imageError ? (
                    <View style={styles.imageErrorContainer}>
                      <Text style={styles.imageErrorText}>Error al cargar la imagen</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: `${Constants.expoConfig?.extra?.apiUrl || 'http://192.168.101.4:3000'}${actividad.imgUrl.replace('/uploads/evidencias/', '/uploads/')}` }}
                      style={styles.evidenceImage}
                      onLoadStart={() => {
                        console.log('Image load start:', `${Constants.expoConfig?.extra?.apiUrl || 'http://192.168.101.4:3000'}${actividad.imgUrl?.replace('/uploads/evidencias/', '/uploads/')}`);
                        setImageLoading(true);
                      }}
                      onLoadEnd={() => {
                        console.log('Image load end');
                        setImageLoading(false);
                      }}
                      onError={(error) => {
                        console.log('Image load error:', error);
                        setImageLoading(false);
                        setImageError(true);
                      }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>
            )}

          </ScrollView>

          {/* Action Buttons */}
          {(() => {
            const hasUpdatePermission = hasPermission('Actividades', 'actividades', 'actualizar');
            const hasDeletePermission = hasPermission('Actividades', 'actividades', 'eliminar');

            console.log('=== BUTTONS RENDER DEBUG ===');
            console.log('displayActivity.estado:', displayActivity.estado);
            console.log('isInitializing:', isInitializing);
            console.log('hasUpdatePermission:', hasUpdatePermission);
            console.log('hasDeletePermission:', hasDeletePermission);
            console.log('onEdit provided:', !!onEdit);
            console.log('onFinalize provided:', !!onFinalize);
            console.log('onDelete provided:', !!onDelete);
            console.log('Should show buttons container:', !isInitializing && (hasUpdatePermission || hasDeletePermission));
            console.log('==============================');

            // Always show buttons if onDelete is provided, regardless of permissions or initialization
            if (!onDelete && !onEdit && !onFinalize) {
              return null;
            }

            return (
              <View style={styles.buttonContainer}>
                {/* First Row: Delete and Edit side by side */}
                <View style={styles.buttonRow}>
                  {onDelete && hasPermission('Actividades', 'actividades', 'eliminar') && (
                    <Boton
                      text="Eliminar"
                      onClick={() => {
                        showAlert(
                          'Confirmar eliminación',
                          '¿Seguro que deseas eliminar esta actividad?\n\nSe devolverán automáticamente las reservas de insumos al inventario.',
                          [
                            { text: 'Cancelar', onPress: () => setAlertVisible(false) },
                            {
                              text: 'Eliminar',
                              style: 'destructive',
                              onPress: () => {
                                console.log('Delete button pressed');
                                setAlertVisible(false);
                                onDelete && onDelete();
                              }
                            }
                          ]
                        );
                      }}
                      color="danger"
                      variant="solid"
                      size="sm"
                    />
                  )}

                  {onEdit && hasPermission('Actividades', 'actividades', 'actualizar') && (
                    <Boton
                      text="Editar A"
                      onClick={() => {
                        console.log('Edit button pressed');
                        onEdit(actividad);
                      }}
                      color="primary"
                      size="sm"
                    />
                  )}
                </View>

                {/* Second Row: Finalize button (if activity is active) */}
                {/* Nota: Se puede finalizar una actividad sin importar si tiene reservas pendientes o no */}
                {onFinalize && displayActivity.estado && hasPermission('Actividades', 'actividades', 'actualizar') && (
                  <View style={styles.buttonRow}>
                    <View style={{ flex: 1 }} />
                    <Boton
                      text="Finalizar"
                      onClick={onFinalize}
                      color="success"
                      size="sm"
                    />
                  </View>
                )}
              </View>
            );
          })()}

          <CustomAlertModal
            isVisible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            buttons={alertButtons}
            onBackdropPress={() => setAlertVisible(false)}
          />
        </View>
      </View>
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
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
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
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
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
  detailSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 22,
  },
  activeStatus: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  completedStatus: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  userItem: {
    marginBottom: 8,
  },
  reservaItem: {
    marginBottom: 8,
  },
  evidenciaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    zIndex: 1,
  },
  imageLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  imageErrorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  imageErrorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  cropType: {
    color: '#111827',
    fontWeight: '600',
  },
  variety: {
    color: '#111827',
    fontWeight: '600',
  },
  zone: {
    color: '#111827',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
    marginBottom: 16,
  },
  infoItem: {
    width: '48%',
    marginRight: '4%',
    marginBottom: 12,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  reservationCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  reservationStatus: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reservationDetails: {
    marginTop: 4,
  },
  reservationInfo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  locationCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  locationValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  costCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  costValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#22c55e',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  totalValue: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  buttonRowDelete: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  finalizeButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  finalizeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ActivityDetailModalO;