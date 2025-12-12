import React, { useState, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { RootStackParamList } from '@/types/General/Navegacion.types';
import MenuO from '@/components/organisms/General/MenuO';
import Boton from '@/components/atoms/Boton';
import CampoTexto from '@/components/atoms/CampoTexto';
import { getAllActividades, getActividadesByDateRange } from '@/services/Modulo Actividades/actividadesService';
import type { Actividad } from '@/types/Modulo Actividades/Actividades.types';
import ActivityDetailModal from '@/components/organisms/Modulo Cultivos/ActivityDetailModal';

interface FiltrosHistorial {
  fechaInicio?: Date;
  fechaFin?: Date;
  busqueda?: string;
  categoriaId?: string;
}

const HistorialActividadesPage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosHistorial>({});

  useEffect(() => {
    loadActividades();
    loadCategorias();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [actividades, filtros]);

  const loadActividades = async () => {
    setLoading(true);
    try {
      console.log('=== CARGANDO ACTIVIDADES ===');
      // Obtener todas las actividades y filtrar solo las finalizadas
      const data = await getAllActividades();
      console.log('Todas las actividades obtenidas:', data);
      console.log('Total de actividades:', data.length);

      const finalizadas = data.filter((act: Actividad) => act.estado === false);
      console.log('Actividades finalizadas (estado === false):', finalizadas);
      console.log('Total de actividades finalizadas:', finalizadas.length);

      const finalizadasConvertidas = finalizadas.map(act => ({
        ...act,
        horasDedicadas: typeof act.horasDedicadas === 'string' ? parseFloat(act.horasDedicadas) || 0 : act.horasDedicadas || 0,
        precioHora: typeof act.precioHora === 'string' ? parseFloat(act.precioHora) || 0 : act.precioHora || 0,
        dniResponsable: typeof act.dniResponsable === 'string' ? parseInt(act.dniResponsable) || 0 : act.dniResponsable || 0,
      }));

      console.log('Actividades finalizadas convertidas:', finalizadasConvertidas);
      setActividades(finalizadasConvertidas);
      console.log('=== FIN CARGA ACTIVIDADES ===');
    } catch (error) {
      console.error('Error loading actividades:', error);
      Alert.alert('Error', 'No se pudieron cargar las actividades finalizadas');
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      // Aquí deberías cargar las categorías desde el servicio correspondiente
      // Por ahora, las obtendremos de las actividades existentes
      const categoriasUnicas = [...new Set(
        actividades
          .map(act => act.categoriaActividad?.nombre)
          .filter(Boolean)
      )];
      setCategorias(categoriasUnicas.map(nombre => ({ nombre })));
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  };

  const aplicarFiltros = () => {
    console.log('=== APLICANDO FILTROS ===');
    console.log('Actividades antes de filtrar:', actividades.length);
    console.log('Filtros aplicados:', filtros);

    let filtradas = actividades;

    // Filtro por fecha de inicio
    if (filtros.fechaInicio) {
      filtradas = filtradas.filter(act =>
        new Date(act.fechaAsignacion) >= filtros.fechaInicio!
      );
    }

    // Filtro por fecha de fin
    if (filtros.fechaFin) {
      filtradas = filtradas.filter(act =>
        new Date(act.fechaAsignacion) <= filtros.fechaFin!
      );
    }

    // Filtro por búsqueda (descripción)
    if (filtros.busqueda) {
      filtradas = filtradas.filter(act =>
        act.descripcion.toLowerCase().includes(filtros.busqueda!.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filtros.categoriaId) {
      filtradas = filtradas.filter(act =>
        act.categoriaActividad?.nombre === filtros.categoriaId
      );
    }

    setActividadesFiltradas(filtradas);
    console.log('Actividades después de filtrar:', filtradas.length);
    console.log('Resultado final:', filtradas);
    console.log('=== FIN APLICAR FILTROS ===');
  };

  const handleActividadPress = (actividad: Actividad) => {
    console.log('=== ACTIVIDAD SELECCIONADA PARA DETALLES ===');
    console.log('ID:', actividad.id);
    console.log('Descripción:', actividad.descripcion);
    console.log('Estado:', actividad.estado ? 'Activa' : 'Finalizada');
    console.log('Fecha de asignación:', actividad.fechaAsignacion);
    console.log('Categoría:', actividad.categoriaActividad?.nombre || 'Sin categoría');
    console.log('DNI Responsable:', actividad.dniResponsable || 'No disponible');
    console.log('Zona:', actividad.cultivoVariedadZona?.zona?.nombre || 'No especificado');

    // Información del cultivo
    const tipoCultivo = actividad.cultivoVariedadZona?.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'No especificado';
    const variedad = actividad.cultivoVariedadZona?.cultivoXVariedad?.variedad?.nombre || 'No especificado';
    const zona = actividad.cultivoVariedadZona?.zona?.nombre || 'No especificado';

    console.log('Tipo de Cultivo:', tipoCultivo);
    console.log('Variedad:', variedad);
    console.log('Zona:', zona);

    // Usuarios asignados
    console.log('Usuarios asignados:', actividad.usuariosAsignados?.length || 0);
    if (actividad.usuariosAsignados && actividad.usuariosAsignados.length > 0) {
      actividad.usuariosAsignados.forEach((usuarioAsignado, index) => {
        const usuario = usuarioAsignado.usuario;
        console.log(`Usuario ${index + 1}:`, usuario?.nombres, usuario?.apellidos, '- DNI:', usuario?.dni);
      });
    }

    // Reservas de insumos
    console.log('Reservas de insumos:', actividad.reservas?.length || 0);
    if (actividad.reservas && actividad.reservas.length > 0) {
      actividad.reservas.forEach((reserva, index) => {
        console.log(`Reserva ${index + 1}:`, reserva.lote?.producto?.nombre, '- Cantidad:', reserva.cantidadReservada, '- Estado:', reserva.estado?.nombre);
      });
    }

    console.log('Horas dedicadas:', actividad.horasDedicadas);
    console.log('Precio por hora:', actividad.precioHora);
    console.log('Observación:', actividad.observacion);
    console.log('Imagen URL:', actividad.imgUrl);
    console.log('Abriendo modal de detalles...');
    console.log('============================');

    setSelectedActividad(actividad);
    setIsDetailModalVisible(true);

    console.log('=== MODAL ABIERTO - ACTIVIDAD PASADA ===');
    console.log('Actividad pasada al modal:', actividad);
    console.log('=====================================');
  };

  const handleFiltroChange = (key: keyof FiltrosHistorial, value: any) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({});
  };

  const renderActividadItem = ({ item }: { item: Actividad }) => {
    console.log('=== RENDERIZANDO ACTIVIDAD ===');
    console.log('Actividad:', item.descripcion);
    console.log('ID:', item.id);
    console.log('Estado:', item.estado);
    console.log('Categoria:', item.categoria || item.categoriaActividad?.nombre);

    const fecha = (() => {
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
    })();
    const categoria = item.categoria || item.categoriaActividad?.nombre || 'Sin categoría';
    const tipoCultivo = item.cultivoVariedadZona?.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'N/A';
    const zona = item.zona || item.cultivoVariedadZona?.zona?.nombre || 'N/A';

    console.log('Fecha formateada:', fecha);
    console.log('Categoria final:', categoria);
    console.log('Tipo cultivo:', tipoCultivo);
    console.log('Zona:', zona);

    return (
      <TouchableOpacity
        style={styles.actividadCard}
        onPress={() => handleActividadPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.descripcion}
          </Text>
          <Text style={styles.cardDate}>{fecha}</Text>
        </View>

        <View style={styles.cardDetails}>
          <Text style={styles.cardInfo}>Categoría: {categoria}</Text>
          <Text style={styles.cardInfo}>Tipo de Cultivo: {tipoCultivo}</Text>
          <Text style={styles.cardInfo}>Zona: {zona}</Text>
          <Text style={styles.cardInfo}>Horas: {item.horasDedicadas || 0}</Text>
          <Text style={styles.cardInfo}>Precio/Hora: ${item.precioHora || 0}</Text>
        </View>

        {item.observacion && (
          <Text style={styles.cardObservacion} numberOfLines={2}>
            Observación: {item.observacion}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  console.log("=== HISTORIAL ACTIVIDADES PAGE RENDER ===");
  console.log("Loading:", loading);
  console.log("Actividades totales:", actividades?.length);
  console.log("Actividades filtradas:", actividadesFiltradas?.length);
  console.log("Actividades actuales:", actividades);
  console.log("=====================================");

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
        <Text style={styles.headerTitle}>Historial de Actividades</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView>
        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <Text style={styles.sectionTitle}>Filtros de Búsqueda</Text>

          <CampoTexto
            etiqueta="Buscar por descripción"
            marcador="Escribe para buscar..."
            valor={filtros.busqueda || ''}
            alCambiar={(text) => handleFiltroChange('busqueda', text)}
          />

          <View style={styles.dateFilters}>
            <CampoTexto
              etiqueta="Fecha Inicio"
              marcador="YYYY-MM-DD"
              valor={filtros.fechaInicio ? filtros.fechaInicio.toISOString().split('T')[0] : ''}
              alCambiar={(text) => handleFiltroChange('fechaInicio', text ? new Date(text) : undefined)}
            />
            <CampoTexto
              etiqueta="Fecha Fin"
              marcador="YYYY-MM-DD"
              valor={filtros.fechaFin ? filtros.fechaFin.toISOString().split('T')[0] : ''}
              alCambiar={(text) => handleFiltroChange('fechaFin', text ? new Date(text) : undefined)}
            />
          </View>

          <View style={styles.categoriaFilter}>
            <Text style={styles.label}>Categoría</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => {
                // Mostrar selector de categoría
                Alert.alert(
                  'Seleccionar Categoría',
                  'Elige una categoría',
                  [
                    { text: 'Todas', onPress: () => handleFiltroChange('categoriaId', undefined) },
                    ...categorias.map(cat => ({
                      text: cat.nombre,
                      onPress: () => handleFiltroChange('categoriaId', cat.nombre)
                    })),
                    { text: 'Cancelar', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.selectorText}>
                {filtros.categoriaId || 'Todas las categorías'}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={limpiarFiltros}
          >
            <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Actividades */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>
            Historial de Actividades Finalizadas ({actividadesFiltradas.length})
          </Text>
          <Text style={styles.subtitle}>Toca cualquier actividad para ver todos los detalles</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Cargando actividades...</Text>
            </View>
          ) : actividadesFiltradas.length === 0 ? (
            <Text style={styles.emptyText}>
              {actividades.length === 0
                ? 'No hay actividades finalizadas'
                : 'No se encontraron actividades con los filtros aplicados'
              }
            </Text>
          ) : (
            <FlatList
              data={actividadesFiltradas}
              renderItem={renderActividadItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Modal de Detalles */}
      <ActivityDetailModal
        isOpen={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        activity={selectedActividad}
        cultivo={{
          nombrecultivo: 'Actividad Histórica',
          lote: 'N/A',
          tipo_cultivo_nombre: 'N/A',
        }}
      />
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
    paddingVertical: 12,
    paddingTop: 45,
    shadowColor: '#000',
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
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  categoriaFilter: {
    marginBottom: 16,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#374151',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#6b7280',
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
  dateFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  activitiesContainer: {
    flex: 1,
  },
  actividadCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  cardDate: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  cardDetails: {
    marginBottom: 12,
  },
  cardInfo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  cardObservacion: {
    fontSize: 14,
    color: '#059669',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 40,
  },
});

export default HistorialActividadesPage;