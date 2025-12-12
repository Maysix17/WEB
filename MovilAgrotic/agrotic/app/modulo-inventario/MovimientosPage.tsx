import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import MenuO from "@/components/organisms/General/MenuO";
import CampoTexto from "@/components/atoms/CampoTexto";
import { movimientosService } from "@/services/General/movimientosService";
import type { MovimientoInventario, MovimientosFilters } from "@/types/Modulo Inventario/movements.types";

const MovimientosPage = () => {
  //estado para inventarios
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [movements, setMovements] = useState<MovimientoInventario[]>([]);
  const [allMovements, setAllMovements] = useState<MovimientoInventario[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MovimientosFilters>({});
  const [productSearch, setProductSearch] = useState("");
  const [filterDate, setFilterDate] = useState({ year: '', month: '', day: '' });
//los carga inicial
  useEffect(() => {
    fetchAllMovements();
  }, []);

  useEffect(() => {
    if (allMovements.length > 0) {
      applyFilters();
    }
  }, [allMovements, productSearch, filterDate]);

  //y aca hacemos uso con la funcion, llamamos al servicio para obtener los movimientos

  const fetchAllMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      // Llamada al servicio movimientosService.getAll() para obtener todos los movimientos de inventario desde la API
      const data = await movimientosService.getAll();
      console.log('Movements data:', data);
      setAllMovements(data);
      setMovements(data);
      setFilteredMovements(data);
    } catch (err: any) {
      console.error("Error fetching movements:", err);
      setError(err.response?.data?.message || "Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = allMovements;

    if (productSearch.trim()) {
      filtered = filtered.filter((item: any) =>
        (item.lote?.producto?.nombre?.toLowerCase() || '').includes(productSearch.toLowerCase()) ||
        (item.lote?.producto?.sku?.toLowerCase() || '').includes(productSearch.toLowerCase())
      );
    }

    if (filterDate.year && filterDate.month && filterDate.day) {
      filtered = filtered.filter((item: any) => {
        const itemDate = new Date(item.fechaMovimiento);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth() + 1; // getMonth() is 0-based
        const itemDay = itemDate.getDate();
        return itemYear === parseInt(filterDate.year) &&
               itemMonth === parseInt(filterDate.month) &&
               itemDay === parseInt(filterDate.day);
      });
    }

    setFilteredMovements(filtered);
  };

  const handleProductSearch = (query: string) => {
    setProductSearch(query);
    setFilters(prev => ({
      ...prev,
      productQuery: query || undefined,
    }));
  };


  const renderMovementItem = ({ item }: { item: MovimientoInventario }) => (
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Movimientos</Text>
        <View style={styles.headerRight} />
      </View>


      <View style={styles.content}>
        {/* Lista de Movimientos */}
        <View style={styles.movementsContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              <View style={{ marginBottom: 8 }}>
                <CampoTexto
                  etiqueta="Buscar por nombre o código del producto"
                  marcador="Nombre o código..."
                  valor={productSearch}
                  alCambiar={handleProductSearch}
                />
              </View>

              <View style={styles.dateFilters}>
                <Text style={styles.dateLabel}>Filtrar por fecha</Text>
                <Text style={styles.dateFilterNote}>Filtros de fecha deshabilitados temporalmente</Text>
              </View>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setProductSearch('');
                  setFilterDate({ year: '', month: '', day: '' });
                  setFilters({});
                  setFilteredMovements(allMovements);
                }}
              >
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>
              Movimientos ({filteredMovements.length})
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={styles.loadingText}>Cargando movimientos...</Text>
              </View>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : filteredMovements.length === 0 ? (
              <Text style={styles.emptyText}>No se encontraron movimientos</Text>
            ) : (
              filteredMovements.map((item) => (
                <View key={item.id}>
                  {renderMovementItem({ item })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
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
  dateFilters: {
    marginTop: 16,
  },
  movementsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
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
    color: "#ef4444",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    padding: 20,
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
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dateFilterNote: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MovimientosPage;