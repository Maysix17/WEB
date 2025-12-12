import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator, // Asegúrate de que ActivityIndicator se use para el loading
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Importaciones de tus componentes y servicios
import Boton from "../../components/atoms/Boton";
import CampoTexto from "../../components/atoms/CampoTexto";
import ActividadModalO from "@/components/organisms/Modulo Actividades/ActividadModalO";
import EditActividadModalO from "@/components/organisms/Modulo Actividades/EditActividadModalO";
import ActivityDetailModalO from "@/components/organisms/Modulo Actividades/ActivityDetailModalO";
import ActivityListModalO from "@/components/organisms/Modulo Actividades/ActivityListModalO";
import FinalizarActividadModalO from "@/components/organisms/Modulo Actividades/FinalizarActividadModalO";
import MenuO from "@/components/organisms/General/MenuO";
import CustomAlertModal from "@/components/molecules/CustomAlertModal";
import { getAllActividades, getActividadesCountByDate, getActividadesByDateWithActive, deleteActividad } from "@/services/Modulo Actividades/actividadesService"; // Asume que existe
import type { Actividad } from "@/types/Modulo Actividades/Actividades.types"; // Asume que existe
import { useRouter } from 'expo-router';
import { usePermission } from "@/contexts/PermissionContext";

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.']
};
LocaleConfig.defaultLocale = 'es';

const ActividadesPage = () => {
  const router = useRouter();
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedActivityForFinalize, setSelectedActivityForFinalize] = useState<Actividad | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedActivityForDetail, setSelectedActivityForDetail] = useState<Actividad | null>(null);
  const [activityToUpdate, setActivityToUpdate] = useState<Actividad | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedActivityForEdit, setSelectedActivityForEdit] = useState<Actividad | null>(null);
  const [searchText, setSearchText] = useState('');

  // Calendar states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityCounts, setActivityCounts] = useState<{[key: string]: number}>({});
  const [activitiesForDate, setActivitiesForDate] = useState<Actividad[]>([]);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchEvents(selectedDate);
    } else {
      loadActividades();
    }
  }, [viewMode, selectedDate, lastUpdate]);

  const loadActividades = async () => {
    setLoading(true);
    try {
      const data = await getAllActividades();
      setActividades(data);
    } catch (error) {
      console.error('Error loading actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (viewMode === 'calendar') {
      await fetchEvents(selectedDate);
    } else {
      await loadActividades();
    }
    setRefreshing(false);
  };

  const fetchEvents = async (date: Date) => {
    setLoading(true);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    try {
      // Fetch activity counts for the month
      const daysInMonth = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        daysInMonth.push(new Date(d));
      }

      const countsPromises = daysInMonth.map(async (day) => {
        const dateStr = day.toISOString().split('T')[0];
        try {
          const count = await getActividadesCountByDate(dateStr);
          return { dateStr, count };
        } catch {
          return { dateStr, count: 0 };
        }
      });
      const countsArray = await Promise.all(countsPromises);
      const countsObj = countsArray.reduce((acc, curr) => ({ ...acc, [curr.dateStr]: curr.count }), {});
      setActivityCounts(countsObj);
    } catch (error) {
      console.error('Error fetching events:', error);
      setActivityCounts({});
    } finally {
      setLoading(false);
    }
  };


  const handleActivityCreated = async () => {
    if (viewMode === 'calendar') {
      await fetchEvents(selectedDate);
    } else {
      await loadActividades();
    }
  };

  const handleActivityFinalized = async () => {
    if (viewMode === 'calendar') {
      await fetchEvents(selectedDate);
    } else {
      await loadActividades();
    }
  };

  const handleActivityDeleted = async () => {
    if (viewMode === 'calendar') {
      await fetchEvents(selectedDate);
    } else {
      await loadActividades();
    }
  };

  const handleDeleteActivity = async (actividad: Actividad) => {
    try {
      console.log('Deleting activity:', actividad.id);
      await deleteActividad(actividad.id);
      console.log('Activity deleted successfully');
      
      // Refresh the data
      if (viewMode === 'calendar') {
        await fetchEvents(selectedDate);
      } else {
        await loadActividades();
      }
      
      // Close the detail modal
      setIsDetailModalOpen(false);
      setSelectedActivityForDetail(null);
      
      // Show success message using custom alert
      setAlertTitle('Éxito');
      setAlertMessage('Actividad eliminada correctamente');
      setAlertButtons([{
        text: 'OK',
        onPress: () => setAlertVisible(false)
      }]);
      setAlertVisible(true);
    } catch (error) {
      console.error('Error deleting activity:', error);
      // Show error message using custom alert
      const err = error as any;
      let errorMessage = 'No se pudo eliminar la actividad. Por favor, inténtalo de nuevo.';
      
      // Provide more specific error information
      if (err.response?.data?.message?.includes('foreign key constraint') ||
          err.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Error de base de datos. Si el problema persiste, contacta al administrador.';
      }
      
      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertButtons([{
        text: 'OK',
        onPress: () => setAlertVisible(false)
      }]);
      setAlertVisible(true);
    }
  };

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    getActividadesByDateWithActive(dateStr).then(activities => {
      setActivitiesForDate(activities);
      setModalDate(new Date(dateStr));
      setIsListModalOpen(true);
    }).catch(error => {
      console.error('Error fetching activities:', error);
      // Even on error, allow creating new activity
      setModalDate(new Date(dateStr));
      setActivitiesForDate([]);
      setIsListModalOpen(true);
    });
  };

  const filteredActividades = actividades.filter((act) => {
    const matchesSearch = !searchText ||
      act.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
      (act as any).responsableNombre?.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const renderActividadItem = ({ item }: { item: Actividad }) => (
    <TouchableOpacity
      style={styles.actividadCard}
      onPress={() => {
        setSelectedActivityForDetail(item);
        setIsDetailModalOpen(true);
      }}
    >
      <View style={styles.actividadHeader}>
        <Text style={styles.actividadTitle}>{item.descripcion}</Text>
        <View style={[styles.statusIndicator, item.estado ? styles.statusActive : styles.statusCompleted]} />
      </View>
      <Text style={styles.actividadInfo}>Fecha: {item.fechaAsignacion ? (() => {
        const dateStr = item.fechaAsignacion;
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
      })() : 'No definida'}</Text>
      <View style={styles.actividadDetails}>
        <Text style={[styles.actividadInfo, item.estado ? styles.activeStatus : styles.completedStatus]}>
          {item.estado ? 'Activa' : 'Finalizada'}
        </Text>
        <Text style={styles.actividadInfo}>Horas: {item.horasDedicadas || 0}</Text>
      </View>
      <View style={styles.actividadActions}>
        <Boton text="Ver Detalles" onClick={() => {
          setSelectedActivityForDetail(item);
          setIsDetailModalOpen(true);
        }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Actividades</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.activityMenuButton}
            onPress={() => {
              setAlertTitle('Más Opciones');
              setAlertMessage('');
              setAlertButtons([
                { text: 'Ver Lista', onPress: () => { setViewMode('list'); setAlertVisible(false); } },
                { text: 'Historial de Actividades', onPress: () => { router.push('/modulo-actividades/HistorialActividadesPage'); setAlertVisible(false); } },
                { text: 'Cancelar', onPress: () => setAlertVisible(false), style: 'cancel' }
              ]);
              setAlertVisible(true);
            }}
          >
           { /*<text style={styles.menuDots}>⋮</Text>*/}
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador de Carga Inicial */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text>Cargando actividades...</Text>
        </View>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.calendarContainer}>
            <Text style={styles.sectionTitle}>Calendario de Actividades</Text>
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              onMonthChange={(month) => {
                const newDate = new Date(month.year, month.month - 1, 1);
                setSelectedDate(newDate);
              }}
              markedDates={Object.keys(activityCounts).reduce((acc, date) => {
                const count = activityCounts[date];
                if (count > 0) {
                  acc[date] = { marked: true, dots: [{ color: 'blue' }] };
                }
                return acc;
              }, {} as any)}
              onDayPress={handleDayPress}
              theme={{
                todayTextColor: '#066839',
                dayTextColor: '#2d3748',
                textDisabledColor: '#d9d9d9',
                monthTextColor: '#066839',
                indicatorColor: '#066839',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />
          </View>
        </ScrollView>
      ) : (
        /* List View */
        <>
          {/* Filtros */}
          <View style={styles.filtersContainer}>
            <Text style={styles.sectionTitle}>Filtros de Búsqueda</Text>

            <CampoTexto
              etiqueta="Buscar por descripción o responsable"
              marcador="Descripción o responsable..."
              valor={searchText}
              alCambiar={setSearchText}
            />

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
              }}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actividadesContainer}>
            <Text style={styles.sectionTitle}>Actividades ({filteredActividades.length})</Text>

            <FlatList
              data={filteredActividades}
              renderItem={renderActividadItem}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay actividades que coincidan con los filtros</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
            />
          </View>
        </>
      )}

      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Modal de Actividad */}
      <ActividadModalO
        isVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActivityToUpdate(null);
        }}
        selectedDate={modalDate}
        onActivityCreated={handleActivityCreated}
        activityToUpdate={activityToUpdate}
      />

      {/* Modal de Editar Actividad */}
      <EditActividadModalO
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedActivityForEdit(null);
        }}
        activity={selectedActivityForEdit}
        onActivityUpdated={handleActivityCreated}
      />

      {/* Modal de Finalizar Actividad */}
      <FinalizarActividadModalO
        isVisible={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        actividad={selectedActivityForFinalize}
        onActivityFinalized={handleActivityFinalized}
      />

  {/* Modal de Detalles de Actividad */}
  <ActivityDetailModalO
    isVisible={isDetailModalOpen}
    onClose={() => {
      setIsDetailModalOpen(false);
      setSelectedActivityForDetail(null); // Limpiar datos al cerrar
    }}
    actividad={selectedActivityForDetail}
    onFinalize={() => {
      // Lógica: Solo puedes finalizar actividades que están activas (estado: true)
      // Nota: Se puede finalizar una actividad sin importar si tiene reservas de insumos pendientes o no
      if (selectedActivityForDetail && selectedActivityForDetail.estado) {
        setSelectedActivityForFinalize(selectedActivityForDetail);
        setIsDetailModalOpen(false);
        setIsFinalizeModalOpen(true);
      }
    }}
    onEdit={(activity) => {
      if (activity) {
        setSelectedActivityForEdit(activity);
        setIsEditModalOpen(true);
        setIsDetailModalOpen(false);
      }
    }}
    onDelete={() => {
      if (selectedActivityForDetail) {
        handleDeleteActivity(selectedActivityForDetail);
      }
    }}
  />

      {/* Modal de Lista de Actividades */}
      <ActivityListModalO
        isVisible={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        activities={activitiesForDate}
        onCreateNew={() => {
          setIsModalOpen(true);
          setIsListModalOpen(false);
        }}
        onActivityPress={(activity) => {
          setSelectedActivityForDetail(activity);
          setIsDetailModalOpen(true);
          setIsListModalOpen(false);
        }}
        canCreateActivity={!isInitializing && hasPermission('Actividades', 'actividades', 'crear')}
      />


      {/* Custom Alert Modal */}
      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#066839",
    paddingHorizontal: 16,
    height: Dimensions.get('window').height * 0.1,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    shadowColor: "#e2e8f0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  filtersContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterFull: {
    flex: 1,
  },
  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  actividadesContainer: {
    flex: 1,
    padding: 16,
  },
  actividadCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actividadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  actividadHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  actividadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  actividadActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: "#066839",
  },
  statusCompleted: {
    backgroundColor: "#ef4444",
  },
  actividadDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actividadInfo: {
    fontSize: 14,
    color: "#374151",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#ef4444",
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  activeStatus: {
    color: "#22c55e",
    fontWeight: "bold",
  },
  completedStatus: {
    color: "#ef4444",
    fontWeight: "bold",
  },
  dateFilters: {
    marginTop: 5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    // flex: 1, removed to allow space-between
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dateFilterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 3,
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  selectedDateText: {
    fontSize: 12,
    color: '#6b7280',
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
  viewToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  viewToggleText: {
    color: '#066839',
    fontSize: 14,
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  headerContainer: {
    paddingBottom: 16,
  },
  activityMenuButton: {
    padding: 12,
  },
  menuDots: {
    fontSize: 24,
    color: '#ffffff',
  },
  flatList: {
    flex: 1,
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#066839',
    textAlign: 'center',
    flex: 1,
  },
  pickerNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default ActividadesPage;