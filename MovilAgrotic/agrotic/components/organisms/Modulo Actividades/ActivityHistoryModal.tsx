import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Constants from 'expo-constants';
import Boton from '../../atoms/Boton';
import { getAllActividades } from '../../../services/Modulo Actividades/actividadesService';
import type { Actividad } from '../../../types/Modulo Actividades/Actividades.types';

interface ActivityHistoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onActivityPress?: (activity: Actividad) => void;
}

const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isVisible,
  onClose,
  onActivityPress,
}) => {
  const [activities, setActivities] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredActivities, setFilteredActivities] = useState<Actividad[]>([]);

  useEffect(() => {
    if (isVisible) {
      loadActivities();
    }
  }, [isVisible]);

  useEffect(() => {
    filterActivitiesByDate();
  }, [activities, selectedDate]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await getAllActividades();
      // Sort by date descending (most recent first)
      const sortedActivities = data.sort((a, b) =>
        new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime()
      );

      // Enrich activities with additional data
      const enrichedActivities = await enrichActivitiesWithData(sortedActivities);
      setActivities(enrichedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrichActivitiesWithData = async (activities: Actividad[]) => {
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const enrichedActivity = { ...activity };

        try {
          // Fetch categoria
          if ((activity as any).fkCategoriaActividadId) {
            const categoriaRes = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/categoria-actividad/${(activity as any).fkCategoriaActividadId}`);
            if (categoriaRes.ok) {
              const categoria = await categoriaRes.json();
              (enrichedActivity as any).categoria = categoria.nombre;
            }
          }

          // Fetch cultivo data
          if ((activity as any).fkCultivoVariedadZonaId) {
            const cultivoRes = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/cultivos-variedad-x-zona/${(activity as any).fkCultivoVariedadZonaId}`);
            if (cultivoRes.ok) {
              const cultivoData = await cultivoRes.json();
              (enrichedActivity as any).zona = cultivoData.zona?.nombre;
              (enrichedActivity as any).tipoCultivo = cultivoData.cultivoXVariedad?.cultivo?.nombre;
              (enrichedActivity as any).variedad = cultivoData.cultivoXVariedad?.variedad?.nombre;
            }
          }

          // Fetch usuarios asignados
          try {
            const usuariosRes = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/usuarios-x-actividades/actividad/${activity.id}`);
            if (usuariosRes.ok) {
              const usuarios = await usuariosRes.json();
              (enrichedActivity as any).usuariosAsignados = usuarios;
              (enrichedActivity as any).usuariosCount = usuarios.length;
            }
          } catch (error) {
            (enrichedActivity as any).usuariosAsignados = [];
            (enrichedActivity as any).usuariosCount = 0;
          }

          // Fetch reservas
          try {
            const reservasRes = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/actividades/${activity.id}/reservas`);
            if (reservasRes.ok) {
              const reservas = await reservasRes.json();
              (enrichedActivity as any).reservas = reservas;
            }
          } catch (error) {
            (enrichedActivity as any).reservas = [];
          }

        } catch (error) {
          console.error(`Error enriching activity ${activity.id}:`, error);
        }

        return enrichedActivity;
      })
    );

    return enriched;
  };

  const filterActivitiesByDate = () => {
    if (!selectedDate) {
      setFilteredActivities(activities);
      return;
    }

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const filtered = activities.filter(activity => {
      const activityDate = new Date(activity.fechaAsignacion).toISOString().split('T')[0];
      return activityDate === selectedDateStr;
    });
    setFilteredActivities(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCultivoInfo = (activity: Actividad) => {
    if (activity.cultivoVariedadZona) {
      const zona = activity.cultivoVariedadZona.zona?.nombre || '';
      const variedad = activity.cultivoVariedadZona.cultivoXVariedad?.variedad?.nombre || '';
      const tipo = activity.cultivoVariedadZona.cultivoXVariedad?.cultivo?.nombre || '';
      return `${zona} - ${tipo} ${variedad}`.trim();
    }
    return 'Sin cultivo asignado';
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Historial de Actividades</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Filtro de Fecha */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filtrar por fecha:</Text>
            <View style={styles.datePickerRow}>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => {
                  Alert.alert(
                    "Seleccionar Año",
                    "",
                    [
                      ...Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => ({
                        text: year.toString(),
                        onPress: () => setSelectedDate(new Date(year, selectedDate.getMonth(), selectedDate.getDate()))
                      })),
                      { text: "Cancelar", style: "cancel" as const }
                    ]
                  );
                }}
              >
                <Text style={styles.datePickerText}>{selectedDate.getFullYear()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => {
                  Alert.alert(
                    "Seleccionar Mes",
                    "",
                    [
                      ...[
                        { label: 'Enero', value: '1' },
                        { label: 'Febrero', value: '2' },
                        { label: 'Marzo', value: '3' },
                        { label: 'Abril', value: '4' },
                        { label: 'Mayo', value: '5' },
                        { label: 'Junio', value: '6' },
                        { label: 'Julio', value: '7' },
                        { label: 'Agosto', value: '8' },
                        { label: 'Septiembre', value: '9' },
                        { label: 'Octubre', value: '10' },
                        { label: 'Noviembre', value: '11' },
                        { label: 'Diciembre', value: '12' },
                      ].map(month => ({
                        text: month.label,
                        onPress: () => setSelectedDate(new Date(selectedDate.getFullYear(), parseInt(month.value) - 1, selectedDate.getDate()))
                      })),
                      { text: "Cancelar", style: "cancel" as const }
                    ]
                  );
                }}
              >
                <Text style={styles.datePickerText}>{
                  [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                  ][selectedDate.getMonth()]
                }</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => {
                  Alert.alert(
                    "Seleccionar Día",
                    "",
                    [
                      ...Array.from({length: 31}, (_, i) => i + 1).map(day => ({
                        text: day.toString(),
                        onPress: () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))
                      })),
                      { text: "Cancelar", style: "cancel" as const }
                    ]
                  );
                }}
              >
                <Text style={styles.datePickerText}>{selectedDate.getDate()}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => setSelectedDate(new Date())}
            >
              <Text style={styles.clearFilterText}>Limpiar filtro</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.flatList}
            contentContainerStyle={styles.content}
            data={filteredActivities}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>
                  {loading ? 'Cargando...' : `${filteredActivities.length} actividades ${selectedDate ? `(${formatDate(selectedDate.toISOString().split('T')[0])})` : ''}`}
                </Text>
              </View>
            }
            renderItem={({ item: activity }) => (
               <TouchableOpacity
                 style={styles.activityCard}
                 onPress={() => onActivityPress?.(activity)}
               >
                 <View style={styles.activityHeader}>
                   <Text style={styles.activityTitle}>{activity.descripcion || 'Sin descripción'}</Text>
                   <View style={[styles.statusIndicator, activity.estado ? styles.statusActive : styles.statusCompleted]} />
                 </View>

                 {/* Información básica */}
                 <Text style={[styles.activityInfo, activity.estado ? styles.activeDate : styles.completedDate]}>
                   📅 Fecha: {formatDate(activity.fechaAsignacion)}
                 </Text>
                 <Text style={[styles.activityInfo, activity.estado ? styles.activeStatus : styles.completedStatus]}>
                   ✅ Estado: {activity.estado ? 'Activa' : 'Finalizada'}
                 </Text>
                 <Text style={styles.activityInfo}>
                   ⏰ Horas Dedicadas: {activity.horasDedicadas || 0}
                 </Text>

                 {/* Categoría */}
                 <Text style={styles.activityInfo}>
                   📋 Categoría: {(activity as any).categoria || 'Sin categoría'}
                 </Text>

                 {/* N. Documento Responsable */}
                 {activity.dniResponsable && (
                   <Text style={styles.activityInfo}>
                     👤 N. Documento Responsable: {activity.dniResponsable}
                   </Text>
                 )}

                 {/* Nombre Responsable */}
                 {activity.nombreResponsable && (
                   <Text style={styles.activityInfo}>
                     👥 Nombre Responsable: {activity.nombreResponsable}
                   </Text>
                 )}

                 {/* Precio por Hora */}
                 {activity.precioHora && (
                   <Text style={styles.activityInfo}>
                     💰 Precio/Hora: ${Number(activity.precioHora).toLocaleString('es-CO')}
                   </Text>
                 )}

                 {/* Usuarios Asignados */}
                 {(activity as any).usuariosAsignados && (activity as any).usuariosAsignados.length > 0 && (
                   <View style={styles.usersSection}>
                     <Text style={styles.sectionSubTitle}>👥 Usuarios Asignados ({(activity as any).usuariosAsignados.length}):</Text>
                     {(activity as any).usuariosAsignados.map((usuario: any, index: number) => (
                       <View key={index} style={styles.userItem}>
                         <Text style={styles.userText}>
                           • {usuario.usuario?.nombres && usuario.usuario?.apellidos
                             ? `${usuario.usuario.nombres} ${usuario.usuario.apellidos}`
                             : usuario.usuario?.nombres || usuario.usuario?.apellidos || `Usuario ID: ${usuario.fkUsuarioId || usuario.id}`}
                         </Text>
                         <Text style={styles.userDetail}>
                           DNI: {usuario.usuario?.numero_documento || usuario.usuario?.dni || 'No disponible'}
                         </Text>
                       </View>
                     ))}
                   </View>
                 )}

                 {/* Reservas de Insumos */}
                 {(activity as any).reservas && (activity as any).reservas.length > 0 && (
                   <View style={styles.reservasSection}>
                     <Text style={styles.sectionSubTitle}>📦 Reservas de Insumos ({(activity as any).reservas.length}):</Text>
                     {(activity as any).reservas.map((reserva: any, index: number) => (
                       <View key={index} style={styles.reservaItem}>
                         <Text style={styles.reservaTitle}>
                           • {reserva.lote?.producto?.nombre || 'Producto sin nombre'}
                         </Text>
                         <Text style={styles.reservaDetail}>
                           Reservado: {reserva.cantidadReservada} {reserva.lote?.producto?.unidadMedida?.abreviatura}
                         </Text>
                         <Text style={styles.reservaDetail}>
                           Usado: {reserva.cantidadUsada || 0} {reserva.lote?.producto?.unidadMedida?.abreviatura}
                         </Text>
                       </View>
                     ))}
                   </View>
                 )}

                 {/* Zona del Cultivo */}
                 {(activity as any).zona && (
                   <Text style={styles.activityInfo}>
                     🌍 Zona del Cultivo: {(activity as any).zona}
                   </Text>
                 )}
 
                 {/* Información del Cultivo */}
                 {((activity as any).zona || (activity as any).tipoCultivo || (activity as any).variedad) && (
                   <View style={styles.cultivoSection}>
                     <Text style={styles.sectionSubTitle}>🌱 Información del Cultivo:</Text>
                     {(activity as any).zona && (
                       <Text style={styles.cultivoDetail}>
                         • Zona: {(activity as any).zona}
                       </Text>
                     )}
                     {(activity as any).tipoCultivo && (
                       <Text style={styles.cultivoDetail}>
                         • Tipo: {(activity as any).tipoCultivo}
                       </Text>
                     )}
                     {(activity as any).variedad && (
                       <Text style={styles.cultivoDetail}>
                         • Variedad: {(activity as any).variedad}
                       </Text>
                     )}
                   </View>
                 )}

                 {/* Observación */}
                 {activity.observacion && (
                   <Text style={[styles.activityInfo, styles.observationText]}>
                     💭 Observación: {activity.observacion}
                   </Text>
                 )}

                 {/* Imagen de evidencia */}
                 {activity.imgUrl && (
                   <View style={styles.imageSection}>
                     <Text style={styles.imageLabel}>📷 Evidencia:</Text>
                     <Text style={styles.imageUrl}>{activity.imgUrl}</Text>
                   </View>
                 )}


                 {/* Inventario Utilizado */}
                 {activity.inventarioUtilizado && activity.inventarioUtilizado.length > 0 && (
                   <View style={styles.inventarioSection}>
                     <Text style={styles.sectionSubTitle}>🛠️ Inventario Utilizado:</Text>
                     <Text style={styles.inventarioText}>
                       {activity.inventarioUtilizado.length} elemento(s)
                     </Text>
                   </View>
                 )}
               </TouchableOpacity>
             )}
            ListFooterComponent={
              <View style={styles.buttonContainer}>
                <Boton
                  label="Cerrar"
                  onClick={onClose}
                  variant="solid"
                  color="primary"
                />
              </View>
            }
            showsVerticalScrollIndicator={false}
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
    borderRadius: 12,
    width: '95%',
    height: '80%',
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
  flatList: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#066839',
  },
  statusCompleted: {
    backgroundColor: '#ef4444',
  },
  activityInfo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  observationText: {
    fontStyle: 'italic',
    color: '#6b7280',
  },
  imageSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  imageUrl: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  usersSection: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  sectionSubTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  userItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  userText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  userDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  reservasSection: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  reservaItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  reservaTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  reservaDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  inventarioSection: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inventarioText: {
    fontSize: 14,
    color: '#374151',
  },
  cultivoSection: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  cultivoDetail: {
    fontSize: 14,
    color: '#065f46',
    marginTop: 2,
  },
  activeDate: {
    color: '#066839',
    fontWeight: '600',
  },
  completedDate: {
    color: '#ef4444',
    fontWeight: '600',
  },
  activeStatus: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  completedStatus: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  datePicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  datePickerText: {
    fontSize: 16,
    color: '#374151',
  },
  clearFilterButton: {
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  clearFilterText: {
    color: '#6b7280',
    fontSize: 12,
  },
});

export default ActivityHistoryModal;