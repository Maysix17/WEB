import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from 'expo-router';
import MenuO from "@/components/organisms/General/MenuO";
import apiClient from "@/services/General/axios/axios";
import { getCosechasToday } from "@/services/Modulo Cultivos/cosechasService";
import { movimientosService } from "@/services/General/movimientosService";
import { getProfile } from "@/services/Modulo Usuarios/profileService";
import { ventaService } from "@/services/Modulo Cultivos/ventaService";
import CustomAlertModal from "@/components/molecules/CustomAlertModal";

interface AssignedActivity {
  id: string; // id unico de la asignacion
  actividad: {
    descripcion: string; // descripcion de la actividad
    categoriaActividad: {
      nombre: string; // tipo de actividad (siembra, riego, etc)
    };
    cultivoVariedadZona: {
      zona: {
        nombre: string; // nombre de la zona
      };
    };
    responsable: {
      nombres: string; // nombres del responsable
      apellidos: string; // apellidos del responsable
      rol: {
        nombre: string; // rol del usuario
      };
    };
  };
  fechaAsignacion: string; // fecha de asignacion
}

interface InventoryMovement {
  id: string; // id del movimiento
  userName: string; // nombre del usuario
  date: string; // fecha del movimiento
  type: string; // tipo de movimiento
  product: string; // nombre del producto
}

interface SaleData {
  id: string; // id de la venta
  fecha: string; // fecha de la venta
  cantidad: number; // cantidad vendida
  ingresoTotal: number; // total de ingresos
  cultivo: string; // nombre del cultivo
  zona: string; // zona de origen
}

/**
 * INTERFAZ PARA DATOS DE COSECHAS
 * Información de una cosecha registrada en el sistema
 */
interface HarvestData {
  id: string; // ID único de la cosecha
  fecha: string; // Fecha de la cosecha
  cantidad: number; // Cantidad cosechada
  unidadMedida: string; // Unidad de medida (kg, toneladas, etc.)
  cultivo: string; // Nombre del cultivo cosechado
  zona?: string; // Zona donde se realizó la cosecha
}

/**
 * INTERFAZ PARA DATOS DE USUARIO
 * Información básica del usuario autenticado
 */
interface User {
  nombres: string; // Nombres del usuario
  apellidos: string; // Apellidos del usuario
  rol: {
    nombre: string; // Nombre del rol (ADMIN, OPERARIO, SUPERVISOR)
  };
}

/**
 * COMPONENTE PRINCIPAL DEL DASHBOARD
 *
 * Estado principal del componente que maneja todos los datos mostrados
 */
const DashboardPage = () => {
  const router = useRouter();


  // control menu lateral
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // carga inicial
  const [loading, setLoading] = useState(true);
  // pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  // ultima actualizacion
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // alertas modales
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  // datos dashboard
  const [assignedActivities, setAssignedActivities] = useState<AssignedActivity[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [todaysSales, setTodaysSales] = useState<SaleData[]>([]);
  const [todaysHarvests, setTodaysHarvests] = useState<HarvestData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [pendingActivitiesCount, setPendingActivitiesCount] = useState<number>(0);

  // carga inicial de datos
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // carga actividades asignadas al usuario
  const fetchAssignedActivities = async () => {
    try {
      const response = await apiClient.get('/usuarios-x-actividades');
      const activities = response.data;

      // obtiene detalles de usuario para cada actividad
      const activitiesWithUserDetails = await Promise.all(
        activities.map(async (activity: any) => {
          if (activity.actividad?.dniResponsable) {
            try {
              const userDetails = await getUserByDni(activity.actividad.dniResponsable);
              if (userDetails) {
                return {
                  ...activity,
                  actividad: {
                    ...activity.actividad,
                    responsable: {
                      nombres: userDetails.nombres,
                      apellidos: userDetails.apellidos,
                      rol: {
                        nombre: userDetails.rol?.nombre || 'Sin rol',
                      },
                    },
                  },
                };
              }
            } catch (error) {
              console.error('Error fetching user details:', error);
            }
          }
          return activity;
        })
      );

      setAssignedActivities(activitiesWithUserDetails);
    } catch (error) {
      console.error('Error fetching assigned activities:', error);
    }
  };

  const getUserByDni = async (dni: number) => {
    try {
      const response = await apiClient.get(`/usuarios/search/dni/${dni}`);
      const userData = Array.isArray(response.data) ? response.data[0] : response.data;
      if (!userData) return null;

      return {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        rol: {
          nombre: userData.rol,
        },
      };
    } catch (error) {
      console.error('Error fetching user by DNI:', error);
      return null;
    }
  };

  const fetchTodaysInventoryMovements = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const movements = await movimientosService.getFiltered({
        startDate: startOfDay,
        endDate: endOfDay,
      });

      // Transform the data to match our interface
      const transformedMovements: InventoryMovement[] = movements.map((movement: any) => ({
        id: movement.id,
        userName: movement.responsable || 'Usuario desconocido',
        date: (() => {
          const dateStr = movement.fechaMovimiento;
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
        })(),
        type: movement.tipoMovimiento?.nombre || 'Tipo desconocido',
        product: movement.lote?.producto?.nombre || 'Producto desconocido',
      }));

      setInventoryMovements(transformedMovements);
    } catch (error) {
      console.error('Error fetching today\'s inventory movements:', error);
      setInventoryMovements([]);
    }
  };

  // carga ventas del dia actual
  const fetchTodaysSales = async () => {
    try {
      console.log('Fetching todays sales...');
      const ventas = await ventaService.getVentas();
      console.log('Ventas received:', ventas.length);

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      console.log('Today string:', todayString);

      // filtra ventas del dia
      const todaysVentas = ventas
        .filter(venta => {
          const ventaDate = new Date(venta.fecha).toISOString().split('T')[0];
          console.log('Venta date:', venta.fecha, 'parsed:', ventaDate, 'matches:', ventaDate === todayString);
          return ventaDate === todayString;
        })
        .sort((a, b) => b.id.localeCompare(a.id));

      console.log('Todays ventas filtered:', todaysVentas.length);

      if (todaysVentas.length > 0) {
        // Process each sale to get crop details
        const salesData: SaleData[] = await Promise.all(
          todaysVentas.map(async (venta) => {
            try {
              console.log('Fetching harvest for sale:', venta.id, 'cosechaId:', venta.fkCosechaId);
              const harvestResponse = await apiClient.get(`/cosechas/${venta.fkCosechaId}`);
              const harvest = harvestResponse.data;
              console.log('Harvest data:', harvest);

              if (harvest && harvest.cultivosVariedadXZona) {
                const cvz = harvest.cultivosVariedadXZona;
                const tipoCultivo = cvz.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'Tipo desconocido';
                const variedad = cvz.cultivoXVariedad?.variedad?.nombre || 'Variedad desconocida';
                const zona = cvz.zona?.nombre || 'Zona desconocida';

                return {
                  id: venta.id,
                  fecha: venta.fecha,
                  cantidad: parseFloat(String(venta.cantidad)),
                  ingresoTotal: parseFloat(String(venta.cantidad)) * (parseFloat(String(venta.precioUnitario)) || 0),
                  cultivo: `${tipoCultivo}, ${variedad}`,
                  zona: zona,
                };
              } else {
                return {
                  id: venta.id,
                  fecha: venta.fecha,
                  cantidad: parseFloat(String(venta.cantidad)),
                  ingresoTotal: parseFloat(String(venta.cantidad)) * (parseFloat(String(venta.precioUnitario)) || 0),
                  cultivo: 'Cultivo desconocido',
                  zona: 'Zona desconocida',
                };
              }
            } catch (error) {
              console.error('Error fetching harvest for sale:', venta.id, error);
              return {
                id: venta.id,
                fecha: venta.fecha,
                cantidad: parseFloat(String(venta.cantidad)),
                ingresoTotal: parseFloat(String(venta.cantidad)) * (parseFloat(String(venta.precioUnitario)) || 0),
                cultivo: 'Cultivo desconocido',
                zona: 'Zona desconocida',
              };
            }
          })
        );

        console.log('Final sales data:', salesData);
        setTodaysSales(salesData);
      } else {
        console.log('No todays sales found');
        setTodaysSales([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s sales:', error);
      setTodaysSales([]);
    }
  };

  // carga cosechas del dia actual
  const fetchTodaysHarvests = async () => {
    try {
      console.log('Fetching todays harvests...');
      const cosechas = await getCosechasToday();
      console.log('Cosechas received:', cosechas.length, cosechas);

      if (cosechas.length > 0) {
        // procesa cada cosecha para obtener detalles
        const harvestsData: HarvestData[] = cosechas.map((cosecha) => {
          console.log('Processing cosecha:', cosecha.id, cosecha.cultivosVariedadXZona);
          if (cosecha.cultivosVariedadXZona) {
            const cvz = cosecha.cultivosVariedadXZona;
            const tipoCultivo = cvz.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'Tipo desconocido';
            const variedad = cvz.cultivoXVariedad?.variedad?.nombre || 'Variedad desconocida';
            const zona = cvz.zona?.nombre || 'Zona desconocida';

            return {
              id: cosecha.id,
              fecha: cosecha.fecha || '',
              cantidad: cosecha.cantidad,
              unidadMedida: cosecha.unidadMedida,
              cultivo: `${tipoCultivo}, ${variedad}`,
              zona: zona,
            };
          } else {
            return {
              id: cosecha.id,
              fecha: cosecha.fecha || '',
              cantidad: cosecha.cantidad,
              unidadMedida: cosecha.unidadMedida,
              cultivo: 'Cultivo desconocido - Zona desconocida',
            };
          }
        });

        console.log('Final harvests data:', harvestsData);
        setTodaysHarvests(harvestsData);
      } else {
        console.log('No todays harvests found');
        setTodaysHarvests([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s harvests:', error);
      setTodaysHarvests([]);
    }
  };


  const fetchUserProfile = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser({ nombres: 'Usuario', apellidos: 'Ejemplo', rol: { nombre: 'Rol' } });
    }
  };

  const fetchPendingActivitiesCount = async () => {
    try {
      // Obtener actividades asignadas al usuario actual
      const response = await apiClient.get('/usuarios-x-actividades');
      const assignedActivities = response.data;

      // Obtener actividades pendientes del día actual
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Filtrar actividades pendientes (estado = true) del día actual asignadas al usuario
      const pendingActivitiesToday = assignedActivities.filter((assignment: any) => {
        if (!assignment.actividad) return false;
        const activityDate = new Date(assignment.fechaAsignacion || assignment.actividad.fechaAsignacion).toISOString().split('T')[0];
        return activityDate === todayString && assignment.actividad.estado === true;
      });

      setPendingActivitiesCount(pendingActivitiesToday.length);
    } catch (error) {
      console.error('Error fetching pending activities count:', error);
      setPendingActivitiesCount(0);
    }
  };


  // carga todos los datos del dashboard
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true); // pull-to-refresh
    } else {
      setLoading(true); // carga inicial
    }

    try {
      // ejecuta consultas en secuencia para evitar crashes por operaciones concurrentes
      await fetchAssignedActivities().catch(err => console.error('Activities error:', err));
      await fetchTodaysInventoryMovements().catch(err => console.error('Inventory error:', err));
      await fetchTodaysSales().catch(err => console.error('Sales error:', err));
      await fetchTodaysHarvests().catch(err => console.error('Harvests error:', err));
      await fetchUserProfile().catch(err => console.error('Profile error:', err));
      await fetchPendingActivitiesCount().catch(err => console.error('Pending activities error:', err));

      setLastUpdate(new Date()); // actualiza timestamp
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Solo mostrar alerta si es refresh manual, no en carga inicial
      if (isRefresh) {
        showAlert('Error', 'No se pudieron cargar los datos del dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // manejador pull-to-refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  const MetricCard = ({ title, value, subtitle, icon, color, onPress, size = 'normal' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    onPress?: () => void;
    size?: 'normal' | 'wide';
  }) => (
    <TouchableOpacity
      style={[
        styles.metricCard,
        size === 'normal' ? styles.metricCardNormal : styles.metricCardWide,
        { borderLeftColor: color }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.metricIcon}>
        <Text style={styles.metricIconText}>{icon}</Text>
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
        {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#066839" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AgroTic</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#066839']}
            tintColor="#066839"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#066839" />
            <Text style={styles.loadingText}>Cargando dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>
                  ¡Hola, {user ? `${user.nombres} ${user.apellidos}` : 'Usuario'}!
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Rol: {user?.rol.nombre || 'Sin rol'}
                </Text>
              </View>
            </View>

            {/* Key Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informaciòn del Día</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Cosechas"
                  value={todaysHarvests.length}
                  subtitle={`${todaysHarvests.reduce((sum, h) => sum + h.cantidad, 0)} kg total`}
                  icon="🌾"
                  color="#066839"
                  size="normal"
                />
                <MetricCard
                  title="Ventas"
                  value={todaysSales.length}
                  subtitle={`$${todaysSales.reduce((sum, s) => sum + s.ingresoTotal, 0).toFixed(2)}`}
                  icon="💰"
                  color="#2563eb"
                  size="normal"
                />
                <MetricCard
                  title="Movimientos"
                  value={inventoryMovements.length}
                  subtitle="En inventario"
                  icon="📦"
                  color="#7c3aed"
                  size="wide"
                />
              </View>
            </View>


            {/* Last Update Info */}
            {lastUpdate && (
              <View style={styles.lastUpdateContainer}>
                <Text style={styles.lastUpdateText}>
                  Última actualización: {lastUpdate.toLocaleString()}
                </Text>
              </View>
            )}

            {/* Recent Activities 
            {assignedActivities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actividades Recientes</Text>
                <View style={styles.activitiesList}>
                  {assignedActivities.slice(0, 3).map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>
                          {activity.actividad?.descripcion || 'Actividad sin descripción'}
                        </Text>
                        <Text style={styles.activityMeta}>
                          {activity.actividad?.categoriaActividad?.nombre} • {activity.actividad?.cultivoVariedadZona?.zona?.nombre}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}*/}

            {/* Recent Sales 
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ventas Recientes ({todaysSales.length})</Text>
              <View style={styles.harvestsList}>
                {todaysSales.length > 0 ? (
                  todaysSales.slice(0, 3).map((sale) => (
                    <View key={sale.id} style={styles.harvestItem}>
                      <View style={styles.harvestIcon}>
                        <Text style={styles.harvestIconText}>💰</Text>
                      </View>
                      <View style={styles.harvestContent}>
                        <Text style={styles.harvestTitle}>
                          {sale.cultivo}
                        </Text>
                        <Text style={styles.harvestMeta}>
                          {sale.cantidad} kg • ${sale.ingresoTotal.toFixed(2)} • {sale.zona}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyItem}>
                    <Text style={styles.emptyText}>No hay ventas registradas hoy</Text>
                  </View>
                )}
              </View>
            </View>
*/}
            {/* Recent Harvests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cosechas Recientes ({todaysHarvests.length})</Text>
              <View style={styles.harvestsList}>
                {todaysHarvests.length > 0 ? (
                  todaysHarvests.slice(0, 3).map((harvest) => (
                    <View key={harvest.id} style={styles.harvestItem}>
                      <View style={styles.harvestIcon}>
                        <Text style={styles.harvestIconText}>🌱</Text>
                      </View>
                      <View style={styles.harvestContent}>
                        <Text style={styles.harvestTitle}>
                          {harvest.cultivo}
                        </Text>
                        <Text style={styles.harvestMeta}>
                          {harvest.cantidad} {harvest.unidadMedida} • {harvest.zona}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyItem}>
                    <Text style={styles.emptyText}>No hay cosechas registradas hoy</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

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
    backgroundColor: "#f8fafc",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  welcomeCard: {
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    paddingLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricCardNormal: {
    width: '48%',
  },
  metricCardWide: {
    width: '100%',
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricIconText: {
    fontSize: 24,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  activitiesList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  harvestsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  harvestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  harvestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1f2eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  harvestIconText: {
    fontSize: 18,
  },
  harvestContent: {
    flex: 1,
  },
  harvestTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  harvestMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyItem: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: 'center',
  },
  lastUpdateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: 'italic',
  },
});

export default DashboardPage;