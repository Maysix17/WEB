import React, { useEffect, useState, useCallback } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import MenuO from '@/components/organisms/General/MenuO';
// Map functionality removed - only list view available
import CampoTexto from '@/components/atoms/CampoTexto';
import { zonaService, type Zona } from '@/services/Modulo Zonas/zonaService';
import { usePermission } from '@/contexts/PermissionContext';

const ZonasPage = () => {
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [filteredZonas, setFilteredZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastZoneUpdate, setLastZoneUpdate] = useState<Date | null>(null);

  // carga inicial de zonas
  useEffect(() => {
    if (!isInitializing && hasPermission('zonas', 'zonas', 'leer')) {
      loadZonas();
    }
  }, [isInitializing, hasPermission, lastUpdate]);

  // filtra zonas cuando cambian datos o busqueda
  useEffect(() => {
    filterZonas();
  }, [zonas, searchTerm]);

  // carga todas las zonas desde backend
  const loadZonas = async () => {
    setLoading(true);
    try {
      // Llamada al servicio zonaService.getAll() para obtener todas las zonas desde la API
      const data = await zonaService.getAll();
      setZonas(data);
      setLastZoneUpdate(new Date());
    } catch (error) {
      console.error('Error loading zonas:', error);
      Alert.alert('Error', 'No se pudieron cargar las zonas');
    } finally {
      setLoading(false);
    }
  };

  // filtra zonas por nombre
  const filterZonas = useCallback(() => {
    if (!searchTerm) {
      setFilteredZonas(zonas);
      return;
    }

    const filtered = zonas.filter(zona =>
      zona.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredZonas(filtered);
  }, [zonas, searchTerm]);


  const handleSearchChange = useCallback((text: string) => {
    setSearchTerm(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const renderZonaItem = ({ item }: { item: Zona }) => (
    <View style={styles.zonaCard}>
      <View style={styles.zonaHeader}>
        <Text style={styles.zonaTitle}>Zona: {item.nombre}</Text>
      </View>
      <View style={styles.zonaDetails}>
        <Text style={styles.zonaInfo}>
          Tipo: {item.coordenadas?.type === 'polygon' ? 'Lote' : 'Punto'}
        </Text>
        <Text style={styles.zonaInfo}>
          Área: {item.areaMetrosCuadrados ? item.areaMetrosCuadrados.toLocaleString() : 'N/A'} m²
        </Text>
        <Text style={styles.zonaInfo}>
          Conexión: {item.zonaMqttConfigs && item.zonaMqttConfigs.filter(config => config.estado).length > 0 ? (
            `${item.zonaMqttConfigs.filter(config => config.estado).length} Conectado${item.zonaMqttConfigs.filter(config => config.estado).length > 1 ? 's' : ''}`
          ) : 'Desconectado'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zonas</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.filtersContainer}>
          <Text style={styles.sectionTitle}>Filtros de Búsqueda</Text>

          <CampoTexto
            etiqueta="Buscar por nombre de zona"
            marcador="Escribe para buscar..."
            valor={searchTerm}
            alCambiar={handleSearchChange}
          />

          {searchTerm ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isInitializing ? (
          <Text style={styles.loadingText}>Cargando permisos...</Text>
        ) : !hasPermission('zonas', 'zonas', 'leer') ? (
          <Text style={styles.emptyText}>No tienes permisos para ver las zonas</Text>
        ) : loading ? (
          <Text style={styles.loadingText}>Cargando zonas...</Text>
        ) : filteredZonas.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchTerm ? 'No se encontraron zonas que coincidan con la búsqueda' : 'No se encontraron zonas'}
          </Text>
        ) : (
          <FlatList
            data={filteredZonas}
            renderItem={renderZonaItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View>
                <Text style={styles.sectionTitle}>Zonas ({filteredZonas.length})</Text>

                {lastZoneUpdate && (
                  <Text style={styles.lastUpdateText}>
                    Actualizado: {lastZoneUpdate.toLocaleTimeString()}
                  </Text>
                )}
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>

      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#066839',
    paddingHorizontal: 16,
    height: Dimensions.get('window').height * 0.1,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    shadowColor: '#e2e8f0',
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
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  addHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addHeaderButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  zonaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zonaDetails: {
    marginTop: 8,
  },
  zonaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zonaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  zonaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionButtonSmall: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 4,
  },
  actionButtonDelete: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtonTextSmall: {
    fontSize: 14,
  },
  zonaInfo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
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
  lastUpdateText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginBottom: 8,
  },
});

export default ZonasPage;