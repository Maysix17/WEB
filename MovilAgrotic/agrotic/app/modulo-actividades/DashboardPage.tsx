import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import MenuO from "@/components/organisms/General/MenuO";
import apiClient from "@/services/General/axios/axios";
import { getCosechasToday } from "@/services/Modulo Cultivos/cosechasService";
import { movimientosService } from "@/services/General/movimientosService";
import { getProfile } from "@/services/Modulo Usuarios/profileService";
import { ventaService } from "@/services/Modulo Cultivos/ventaService";

interface AssignedActivity {
  id: string;
  actividad: {
    descripcion: string;
    categoriaActividad: {
      nombre: string;
    };
    cultivoVariedadZona: {
      zona: {
        nombre: string;
      };
    };
    responsable: {
      nombres: string;
      apellidos: string;
      rol: {
        nombre: string;
      };
    };
  };
  fechaAsignacion: string;
}

interface InventoryMovement {
  id: string;
  userName: string;
  date: string;
  type: string;
  product: string;
}

interface SaleData {
  id: string;
  fecha: string;
  cantidad: number;
  ingresoTotal: number;
  cultivo: string;
  zona: string;
}

interface HarvestData {
  id: string;
  fecha: string;
  cantidad: number;
  unidadMedida: string;
  cultivo: string;
  zona?: string;
}

interface User {
  nombres: string;
  apellidos: string;
  rol: {
    nombre: string;
  };
}


const DashboardPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [assignedActivities, setAssignedActivities] = useState<AssignedActivity[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [todaysSales, setTodaysSales] = useState<SaleData[]>([]);
  const [todaysHarvests, setTodaysHarvests] = useState<HarvestData[]>([]);
  const [loading, setLoading] = useState(true);

  const menuButtonScale = useSharedValue(1);
  const menuButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuButtonScale.value }],
  }));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchAssignedActivities = async () => {
    try {
      const response = await apiClient.get('/usuarios-x-actividades');
      const activities = response.data;

      // Fetch user details for each activity's responsable
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

  const fetchTodaysSales = async () => {
    try {
      const ventas = await ventaService.getVentas();

      if (ventas.length > 0) {
        // Get today's date
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Filter sales for today
        const todaysVentas = ventas
          .filter(venta => {
            const ventaDate = new Date(venta.fecha).toISOString().split('T')[0];
            return ventaDate === todayString;
          })
          .sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID descending (most recent first)

        if (todaysVentas.length > 0) {
          // Process each sale to get crop details
          const salesData: SaleData[] = await Promise.all(
            todaysVentas.map(async (venta) => {
              try {
                const harvestResponse = await apiClient.get(`/cosechas/${venta.fkCosechaId}`);
                const harvest = harvestResponse.data;

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

          setTodaysSales(salesData);
        } else {
          setTodaysSales([]);
        }
      } else {
        setTodaysSales([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s sales:', error);
      setTodaysSales([]);
    }
  };

  const fetchTodaysHarvests = async () => {
    try {
      const cosechas = await getCosechasToday();

      if (cosechas.length > 0) {
        // Process each harvest to get crop details
        const harvestsData: HarvestData[] = cosechas.map((cosecha) => {
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

        setTodaysHarvests(harvestsData);
      } else {
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAssignedActivities(),
        fetchTodaysInventoryMovements(),
        fetchTodaysSales(),
        fetchTodaysHarvests(),
        fetchUserProfile(),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = () => {
    console.log('Menu button pressed, setting isMenuOpen to true');
    menuButtonScale.value = withTiming(0.9, { duration: 100 }, () => {
      menuButtonScale.value = withTiming(1, { duration: 100 });
      runOnJS(setIsMenuOpen)(true);
    });
  };

  const DashboardCard = ({ title, children, icon, index }: { title: string; children: React.ReactNode; icon?: string; index: number }) => (
    <Animated.View
      style={styles.card}
      entering={FadeInUp.delay(index * 100).duration(600)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {icon && <MaterialIcons name={icon as any} size={24} color="#374151" />}
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#22c55e" />

      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Animated.View style={[styles.menuButton, menuButtonAnimatedStyle]}>
          <TouchableOpacity onPress={handleMenuPress}>
            <MaterialIcons name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.headerTitle}>AgroTic</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.scrollContainer}>
        {/* Simplified Dashboard with 4 large cards */}
        <View style={styles.simpleGrid}>
          <Animated.View style={styles.welcomeCard} entering={FadeInUp.duration(600)}>
            <Text style={styles.welcomeTitle}>
              ¡Bienvenido, {user ? `${user.nombres} ${user.apellidos}` : 'Usuario'}!
            </Text>
            <Text style={styles.roleText}>
              Rol: {user?.rol.nombre || 'Sin rol'}
            </Text>
            <Text style={styles.welcomeMessage}>
              ¡Hola! Aquí tienes un resumen de tu actividad reciente.
            </Text>
          </Animated.View>

          <DashboardCard title="Cosechas de Hoy" icon="agriculture" index={0}>
            {todaysHarvests.length === 0 ? (
              <Text style={styles.emptyText}>No hay cosechas registradas hoy</Text>
            ) : (
              <View>
                {todaysHarvests.map((harvest, index) => (
                  <View key={harvest.id} style={index > 0 ? styles.activitySeparator : null}>
                    <Text style={styles.activityText}>
                      {harvest.cultivo}
                    </Text>
                    <Text style={styles.detailText}>
                      Fecha: {(() => {
                        const dateStr = harvest.fecha;
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
                    <Text style={styles.detailText}>
                      Cantidad: {harvest.cantidad} {harvest.unidadMedida}
                    </Text>
                    {harvest.zona && (
                      <Text style={styles.detailText}>
                        Zona: {harvest.zona}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </DashboardCard>

          <DashboardCard title="Ventas de Hoy" icon="attach-money" index={1}>
            {todaysSales.length === 0 ? (
              <Text style={styles.emptyText}>No hay ventas registradas hoy</Text>
            ) : (
              <View>
                {todaysSales.map((sale, index) => (
                  <View key={sale.id} style={index > 0 ? styles.activitySeparator : null}>
                    <Text style={styles.activityText}>
                      {sale.cultivo} - {sale.zona}
                    </Text>
                    <Text style={styles.detailText}>
                      Fecha: {(() => {
                        const dateStr = sale.fecha;
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
                    <Text style={styles.detailText}>
                      Ingreso: ${sale.ingresoTotal.toFixed(2)} | Cantidad: {sale.cantidad} kg
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </DashboardCard>

          <DashboardCard title="Últimos Movimientos en Inventario" icon="analytics" index={2}>
            {inventoryMovements.length === 0 ? (
              <Text style={styles.emptyText}>No hay movimientos registrados hoy</Text>
            ) : (
              <View>
                {inventoryMovements.map((movement, index) => (
                  <View key={movement.id} style={index > 0 ? styles.activitySeparator : null}>
                    <Text style={styles.activityText}>
                      {movement.type}: {movement.product}
                    </Text>
                    <Text style={styles.detailText}>
                      Usuario: {movement.userName}
                    </Text>
                    <Text style={styles.detailText}>
                      Fecha: {movement.date}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </DashboardCard>
        </View>
      </ScrollView>

      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
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
   backgroundColor: "#22c55e",
   paddingHorizontal: 16,
   paddingVertical: 12,
   paddingTop: 45,
   shadowColor: "#000",
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.1,
   shadowRadius: 4,
   elevation: 4,
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
   width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  mainGrid: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  simpleGrid: {
    flex: 1,
    padding: 16,
  },
  leftColumn: {
    flex: 1.5,
    marginRight: 8,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 8,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  welcomeCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  welcomeSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
   fontSize: 24,
   fontWeight: "bold",
   color: "#111827",
   textAlign: "center",
   marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  cardsContainer: {
   flexDirection: "row",
   justifyContent: "space-between",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  activitySeparator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DashboardPage;