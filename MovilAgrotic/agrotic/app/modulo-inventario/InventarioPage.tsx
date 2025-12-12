import React, { useEffect, useState } from "react";
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import CampoTexto from "../../components/atoms/CampoTexto";
import MenuO from "@/components/organisms/General/MenuO";
import CustomAlertModal from "@/components/molecules/CustomAlertModal";
import { inventarioService } from "@/services/Modulo Inventario/inventarioService";
import { movimientosService } from "@/services/General/movimientosService";
import type { LoteInventario } from "@/types/Modulo Inventario/Inventario.types";
const InventarioPage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventario, setInventario] = useState<LoteInventario[]>([]);
  const [allItems, setAllItems] = useState<LoteInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentView, setCurrentView] = useState<'inventory' | 'movements'>('inventory');
  const [movements, setMovements] = useState<any[]>([]);
  const [allMovements, setAllMovements] = useState<any[]>([]);
  const [currentPageMovements, setCurrentPageMovements] = useState(1);
  const [movementFilters, setMovementFilters] = useState({
    productQuery: '',
    date: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);


  const limit = 10;
  const filteredItems = allItems.filter((item: any) =>
    (item.producto?.nombre?.toLowerCase() || item.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.producto?.sku?.toLowerCase() || item.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredItems.length / limit);
  const totalPagesMovements = Math.ceil(movements.length / limit);

  useEffect(() => {
    fetchAllInventory();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setInventario(filteredItems.slice((currentPage - 1) * limit, currentPage * limit));
      setCurrentPage(1);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allItems, currentPage, filteredItems]);

  useEffect(() => {
    if (currentView === 'movements' && allMovements.length > 0) {
      applyMovementFilters();
    }
  }, [movementFilters, allMovements]);

  const fetchAllInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventarioService.getAll(1, 10000); // Fetch all items
      setAllItems(response.items);
      setInventario(response.items.slice(0, limit));
      setTotal(response.items.length);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      setError(err.response?.data?.message || "Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };



  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllInventory();
    setRefreshing(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageChangeMovements = (page: number) => {
    setCurrentPageMovements(page);
  };

  const handleItemAction = (item: LoteInventario, action: string) => {
    router.push({ pathname: '/modulo-inventario/ProductDetailPage', params: { item: JSON.stringify(item) } });
  };

  const handleViewMovements = async () => {
    setCurrentView('movements');
    setCurrentPageMovements(1);
    await loadMovements();
  };

  const loadMovements = async () => {
    setLoading(true);
    try {
      const data = await movimientosService.getAll();
      setMovements(data);
      setAllMovements(data);
    } catch (error) {
      console.error('Error loading movements:', error);
      setAlertTitle('Error');
      setAlertMessage('No se pudieron cargar los movimientos');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const applyMovementFilters = () => {
    if (!movementFilters.productQuery && !movementFilters.date) {
      // If no filters, reset to all movements
      setMovements(allMovements);
      return;
    }

    try {
      let data = [...allMovements];

      // Filter by product query
      if (movementFilters.productQuery) {
        data = data.filter(movement =>
          movement.lote?.producto?.nombre?.toLowerCase().includes(movementFilters.productQuery.toLowerCase()) ||
          movement.lote?.producto?.sku?.toLowerCase().includes(movementFilters.productQuery.toLowerCase())
        );
      }

      // Filter by date
      if (movementFilters.date) {
        data = data.filter(movement => {
          const movementDate = new Date(movement.fechaMovimiento);
          const filterDate = new Date(movementFilters.date + 'T00:00:00Z');
          return movementDate.toDateString() === filterDate.toDateString();
        });
      }

      setMovements(data);
      setCurrentPageMovements(1);
    } catch (error) {
      console.error('Error filtering movements:', error);
      setAlertTitle('Error');
      setAlertMessage('No se pudieron filtrar los movimientos');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  };

  const renderInventarioItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemAction(item, 'details')}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.producto?.nombre || item.nombre || 'Sin nombre'}</Text>
        <Text style={styles.itemCategory}>{item.producto?.categoria?.nombre || item.categoria?.nombre || 'Sin categoría'}</Text>
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemInfo}>Código: {item.producto?.sku || item.sku || 'Sin código'}</Text>
        <Text style={styles.itemInfo}>Producto: {item.producto?.nombre || item.nombre || 'Sin nombre'}</Text>
        <Text style={styles.itemInfo}>Categoría: {item.producto?.categoria?.nombre || item.categoria?.nombre || 'Sin categoría'}</Text>
        <Text style={styles.itemInfo}>Bodega: {item.bodega?.nombre || 'Sin bodega'}</Text>
        <Text style={styles.itemInfo}>Stock: {item.stock || item.cantidadDisponible || 0}</Text>
        <Text style={styles.itemInfo}>Cant. Total: {item.stockTotal?.toFixed(2) || item.capacidadPresentacion || '0.00'}</Text>
        <Text style={styles.itemInfo}>Disponible: {item.cantidadDisponibleParaReservar?.toFixed(2) || item.cantidadDisponible || '0.00'}</Text>
        <Text style={styles.itemInfo}>Reservas: {item.cantidadReservada?.toFixed(2) || '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMovementItem = ({ item }: { item: any }) => (
    <View style={styles.movementCard}>
      <View style={styles.movementHeader}>
        <Text style={styles.movementDate}>
          {new Date(item.fechaMovimiento).toLocaleDateString()}
        </Text>
        <Text style={styles.movementType}>
          {item.tipoMovimiento?.nombre || 'N/A'}
        </Text>
      </View>

      <View style={styles.movementDetails}>
        <Text style={styles.movementInfo}>
          Producto: {item.lote?.producto?.nombre || 'N/A'}
        </Text>
        <Text style={styles.movementInfo}>
          Código: {item.lote?.producto?.sku || 'N/A'}
        </Text>
        <Text style={styles.movementInfo}>
          Categoría: {item.lote?.producto?.categoria?.nombre || 'N/A'}
        </Text>
        <Text style={styles.movementInfo}>
          Bodega: {item.lote?.bodega?.nombre || 'N/A'}
        </Text>
        <Text style={styles.movementInfo}>
          Cantidad: {item.cantidad}
        </Text>
        <Text style={styles.movementInfo}>
          Observación: {item.observacion || '-'}
        </Text>
        <Text style={styles.movementInfo}>
          Responsable: {item.responsable || '-'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#066839" />

      {/* Header */}
      <View style={styles.header}>
        {currentView === 'inventory' ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setCurrentView('inventory');
              setMovementFilters({ productQuery: '', date: '' });
              setMovements([]);
            }}
          >
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {currentView === 'inventory' ? 'Inventario' : 'Movimientos'}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>


      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {currentView === 'inventory' && (
          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={styles.moreOptionsButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                setAlertTitle("Más opciones");
                setAlertMessage("Selecciona una opción");
                setAlertButtons([
                  { text: "Historial de Movimientos", onPress: () => { handleViewMovements(); setAlertVisible(false); } },
                  { text: "Cancelar", onPress: () => setAlertVisible(false), style: "cancel" },
                ]);
                setAlertVisible(true);
              }}
            >
              <Text style={styles.moreOptionsText}>⋮</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Filtros de Búsqueda</Text>

            <CampoTexto
              etiqueta="Buscar por nombre o código del producto"
              marcador="Nombre o código..."
              valor={searchTerm}
              alCambiar={setSearchTerm}
            />

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentView === 'movements' && (
          <View style={styles.filtersContainer}>
            <Text style={styles.sectionTitle}>Filtros de Movimientos</Text>

            <CampoTexto
              etiqueta="Buscar por nombre del producto"
              marcador="Nombre del producto..."
              valor={movementFilters.productQuery}
              alCambiar={(text) => setMovementFilters(prev => ({ ...prev, productQuery: text }))}
            />

            <View style={styles.dateFilters}>
              <View style={styles.dateInputContainer}>
                <View style={styles.dateLabelRow}>
                  <Text style={styles.dateFilterLabel}>Fecha de Movimiento</Text>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.iconText}>F</Text>
                  </TouchableOpacity>
                </View>
                {movementFilters.date && (
                  <Text style={styles.selectedDateText}>
                    {new Date(movementFilters.date + 'T00:00:00Z').toLocaleDateString('es-CO')}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setMovementFilters({ productQuery: '', date: '' });
                setCurrentPageMovements(1);
              }}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista */}
        <View style={styles.inventarioContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>
                {currentView === 'inventory' ? 'Cargando inventario...' : 'Cargando movimientos...'}
              </Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (currentView === 'inventory' ? inventario.length === 0 : movements.length === 0) ? (
            <Text style={styles.emptyText}>
              {currentView === 'inventory' ? 'No se encontraron productos' : 'No se encontraron movimientos'}
            </Text>
          ) : (
            <FlatList
              data={currentView === 'inventory' ? inventario : movements.slice((currentPageMovements - 1) * limit, currentPageMovements * limit)}
              renderItem={currentView === 'inventory' ? renderInventarioItem : renderMovementItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              refreshControl={
                currentView === 'inventory' ? (
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                ) : undefined
              }
              ListHeaderComponent={
                currentView === 'inventory' ? (
                  <Text style={styles.sectionTitle}>
                    Productos ({filteredItems.length}) - Página {currentPage} de {totalPages}
                  </Text>
                ) : (
                  <Text style={styles.sectionTitle}>
                    Movimientos ({movements.length}) - Página {currentPageMovements} de {totalPagesMovements}
                  </Text>
                )
              }
              ListFooterComponent={
                currentView === 'inventory' && totalPages > 1 ? (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                      onPress={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Text style={styles.pageButtonText}>Anterior</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageInfo}>Página {currentPage} de {totalPages}</Text>
                    <TouchableOpacity
                      style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                      onPress={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <Text style={styles.pageButtonText}>Siguiente</Text>
                    </TouchableOpacity>
                  </View>
                ) : currentView === 'movements' && totalPagesMovements > 1 ? (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.pageButton, currentPageMovements === 1 && styles.pageButtonDisabled]}
                      onPress={() => handlePageChangeMovements(currentPageMovements - 1)}
                      disabled={currentPageMovements === 1}
                    >
                      <Text style={styles.pageButtonText}>Anterior</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageInfo}>Página {currentPageMovements} de {totalPagesMovements}</Text>
                    <TouchableOpacity
                      style={[styles.pageButton, currentPageMovements === totalPagesMovements && styles.pageButtonDisabled]}
                      onPress={() => handlePageChangeMovements(currentPageMovements + 1)}
                      disabled={currentPageMovements === totalPagesMovements}
                    >
                      <Text style={styles.pageButtonText}>Siguiente</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {showDatePicker && (
        <DateTimePicker
          value={movementFilters.date ? new Date(movementFilters.date + 'T00:00:00Z') : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && event.type !== 'dismissed') {
              const isoDate = selectedDate.toISOString().split('T')[0];
              setMovementFilters(prev => ({ ...prev, date: isoDate }));
            }
          }}
        />
      )}

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
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 28,
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filtersContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    right: 10,
    top: 35,
    padding: 5,
  },
  searchIconText: {
    fontSize: 18,
  },
  moreOptionsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreOptionsText: {
    fontSize: 20,
    color: '#6b7280',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  dateFilters: {
    marginTop: 5,
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
  inventarioContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  itemCategory: {
    fontSize: 14,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemDetails: {
    marginBottom: 12,
  },
  itemInfo: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    padding: 20,
  },
  floatingMenuButton: {
    position: "absolute",
    top: 60,
    left: 16,
    backgroundColor: "#f3f4f6", // bg-gray-100
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  floatingMenuIcon: {
    fontSize: 20,
    color: "#374151", // text-gray-800
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    padding: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#066839",
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  pageButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: 14,
    color: "#374151",
  },
  movementCard: {
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
  movementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  movementDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  movementType: {
    fontSize: 14,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  movementDetails: {
    marginBottom: 12,
  },
  movementInfo: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  historyButtonContainer: {
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
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
});

export default InventarioPage;