import React, { useState, useEffect, useReducer, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Boton from '../../atoms/Boton';
import CampoTexto from '../../atoms/CampoTexto';
import ActivityDetailModal from './ActivityDetailModal';
import HarvestSellModal from './HarvestSellModal';
import CosechaModal from './CosechaModal';
import VentaModal from './VentaModal';
import { cultivosService } from '../../../services/Modulo Cultivos/cultivosService';
import apiClient from '../../../services/General/axios/axios';
import type { ItemCultivo } from '../../../types/Modulo Cultivos/Cultivos.types';

interface ModalCultivoDetalleProps {
  isVisible: boolean;
  onClose: () => void;
  cultivo: ItemCultivo | null;
}

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
      unidadMedida?: { abreviatura: string };
      categoria?: { esDivisible: boolean };
      vidaUtilPromedioPorUsos?: number;
    };
  };
  estado?: { nombre: string };
}

interface Actividad {
  id: string;
  descripcion: string;
  fechaAsignacion: string;
  horasDedicadas: number;
  precioHora?: number;
  observacion: string;
  estado: boolean;
  dniResponsable?: number;
  nombreResponsable?: string;
  categoria?: string;
  inventarioUtilizado?: string;
  zona?: string;
  usuariosAsignados?: { nombres: string; dni: string }[];
  imgUrl?: string;
  reservas?: Reservation[];
}

interface Cosecha {
  id: string;
  fecha?: string;
  cantidad: number;
  unidadMedida: string;
  cantidadDisponible: number;
  cerrado: boolean;
}

interface Venta {
  id: string;
  fecha?: string;
  precioUnitario?: number;
  cantidad: number;
  fkCosechaId: string;
}

interface ModalState {
  // Data states
  currentCultivo: ItemCultivo | null;
  actividades: Actividad[];
  cosechas: Cosecha[];
  ventas: Venta[];
  loading: boolean;

  // UI states
  activeTab: string;
  selectedActivityDetail: Actividad | null;
  responsibleUserName: string;

  // Modal visibility states
  isActivityDetailModalVisible: boolean;
  isHarvestSellModalVisible: boolean;
  isCosechaModalVisible: boolean;
  isVentaModalVisible: boolean;

  // Filter states
  categoriaFilter: string;
  fechaAsignacion: string;
  showDatePicker: boolean;
  datePickerTarget: 'fechaAsignacion';
}

type ModalAction =
  | { type: 'SET_CURRENT_CULTIVO'; payload: ItemCultivo | null }
  | { type: 'SET_DATA'; payload: { actividades: Actividad[]; cosechas: Cosecha[]; ventas: Venta[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SELECTED_ACTIVITY'; payload: Actividad | null }
  | { type: 'SET_RESPONSIBLE_NAME'; payload: string }
  | { type: 'SET_MODAL_VISIBILITY'; payload: { key: keyof ModalState; value: boolean } }
  | { type: 'SET_FILTER'; payload: { key: keyof ModalState; value: string } }
  | { type: 'RESET_FILTERS' };

const initialState: ModalState = {
  currentCultivo: null,
  actividades: [],
  cosechas: [],
  ventas: [],
  loading: false,
  activeTab: 'detalles',
  selectedActivityDetail: null,
  responsibleUserName: '',
  isActivityDetailModalVisible: false,
  isHarvestSellModalVisible: false,
  isCosechaModalVisible: false,
  isVentaModalVisible: false,
  categoriaFilter: '',
  fechaAsignacion: '',
  showDatePicker: false,
  datePickerTarget: 'fechaAsignacion',
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'SET_CURRENT_CULTIVO':
      return { ...state, currentCultivo: action.payload };
    case 'SET_DATA':
      return { ...state, ...action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_SELECTED_ACTIVITY':
      return { ...state, selectedActivityDetail: action.payload };
    case 'SET_RESPONSIBLE_NAME':
      return { ...state, responsibleUserName: action.payload };
    case 'SET_MODAL_VISIBILITY':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'SET_FILTER':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'RESET_FILTERS':
      return {
        ...state,
        categoriaFilter: '',
        fechaAsignacion: '',
        showDatePicker: false,
        datePickerTarget: 'fechaAsignacion',
      };
    default:
      return state;
  }
}

const ModalCultivoDetalleO: React.FC<ModalCultivoDetalleProps> = React.memo(({
  isVisible,
  onClose,
  cultivo
}) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  console.log('ModalCultivoDetalleO rendered, isVisible:', isVisible, 'cultivo:', cultivo);
  console.log('currentCultivo:', state.currentCultivo);

  useEffect(() => {
    if (cultivo && isVisible) {
      dispatch({ type: 'SET_CURRENT_CULTIVO', payload: cultivo });
      loadCultivoData(cultivo.cvzid);
    } else if (!isVisible) {
      dispatch({ type: 'RESET_FILTERS' });
      // Clear data when modal closes to free memory
      dispatch({ type: 'SET_DATA', payload: { actividades: [], cosechas: [], ventas: [] } });
      dispatch({ type: 'SET_CURRENT_CULTIVO', payload: null });
    }
  }, [cultivo, isVisible]);

  useEffect(() => {
    if (state.activeTab === 'actividades' && state.currentCultivo && state.actividades.length === 0) {
      loadCultivoData(state.currentCultivo.cvzid);
    }
  }, [state.activeTab, state.currentCultivo, state.actividades.length]);

  const loadCultivoData = async (cvzId: string) => {
    if (!state.currentCultivo) return;
    console.log('loadCultivoData called with cvzId:', cvzId);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [actividadesData, cosechasData, ventasData] = await Promise.all([
        cultivosService.getActividadesByCultivo(cvzId),
        cultivosService.getCosechasByCultivo(cvzId),
        cultivosService.getVentasByCultivo(cvzId)
      ]);

      console.log('Data loaded - actividades:', actividadesData?.length, 'cosechas:', cosechasData?.length, 'ventas:', ventasData?.length);

      // Map actividades to match interface
      const mappedActividades = actividadesData.map((act: any) => ({
        id: act.id,
        descripcion: act.descripcion || 'Sin descripción',
        fechaAsignacion: act.fechaAsignacion || '',
        horasDedicadas: act.horasDedicadas || 0,
        precioHora: act.precioHora || 0,
        observacion: act.observacion || 'Sin observación',
        estado: act.estado || false,
        dniResponsable: act.dniResponsable || '',
        nombreResponsable: act.responsable ? `${act.responsable.nombres} ${act.responsable.apellidos}` : '',
        categoria: act.categoriaActividad?.nombre || act.categoria || 'Sin categoría',
        inventarioUtilizado: act.reservasInsumos || act.inventarioUtilizado || [],
        zona: act.cultivoVariedadZona?.zona?.nombre || act.zona || 'Sin zona',
        usuariosAsignados: act.usuariosAsignados || [],
        imgUrl: act.imgUrl || '',
        reservas: act.reservas || [],
      }));

      dispatch({ type: 'SET_DATA', payload: { actividades: mappedActividades, cosechas: cosechasData, ventas: ventasData } });
      console.log('Data set successfully');
    } catch (error) {
      console.error('Error loading cultivo data:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del cultivo');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const calcularEdadCultivo = (fechaSiembra: string): number => {
    return cultivosService.calcularEdadCultivo(fechaSiembra);
  };

  const calcularTotalIngresos = useMemo((): number => {
    return state.ventas.reduce((sum: number, venta: Venta) => sum + (venta.precioUnitario || 0) * venta.cantidad, 0);
  }, [state.ventas]);

  const calcularTotalGastos = useMemo((): number => {
    return state.actividades.reduce((sum: number, act: Actividad) => sum + (act.horasDedicadas || 0) * 10, 0);
  }, [state.actividades]);

  const calcularCostosTotales = useMemo((): number => {
    return state.actividades.reduce((sum: number, act: Actividad) => sum + (act.horasDedicadas || 0) * 10, 0);
  }, [state.actividades]);

  const calcularIngresosTotales = useMemo((): number => {
    return state.ventas.reduce((sum: number, venta: Venta) => sum + (venta.precioUnitario || 0) * venta.cantidad, 0);
  }, [state.ventas]);

  const calculateCostoManoObra = (actividad: Actividad) => {
    const horas = actividad.horasDedicadas || 0;
    const precio = actividad.precioHora || 0;
    return horas * precio;
  };

  const calculateCostoInventario = (actividad: Actividad) => {
    // Usar EXACTAMENTE la lógica del backend calculateActivityCosts
    if (!actividad.reservas || actividad.reservas.length === 0) return 0;

    return actividad.reservas.reduce((total, reserva) => {
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

  const calculateCostoTotalActividad = (actividad: Actividad) => {
    return calculateCostoManoObra(actividad) + calculateCostoInventario(actividad);
  };

  const getInventoryUsed = (actividad: Actividad) => {
    if (!actividad.reservas || actividad.reservas.length === 0) return 'Sin inventario';
    return actividad.reservas
      .map((r: Reservation) => {
        const esConsumible = r.lote?.producto?.categoria?.esDivisible ?? true;
        const cantidad = esConsumible ? (r.cantidadUsada || 0) : (r.cantidadUsada || 0);
        return `${r.lote?.producto?.nombre} (${cantidad} ${r.lote?.producto?.unidadMedida?.abreviatura})`;
      })
      .join(', ');
  };

  const filteredActividades = useMemo(() => {
    return state.actividades.filter((act: Actividad) => {
      const isFinalizada = act.estado === false; // Only show finalized activities
      const matchesCategoria = !state.categoriaFilter || act.categoria?.toLowerCase().includes(state.categoriaFilter.toLowerCase());
      const matchesFechaAsignacion = !state.fechaAsignacion || new Date(act.fechaAsignacion).toDateString() === new Date(state.fechaAsignacion).toDateString();
      return isFinalizada && matchesCategoria && matchesFechaAsignacion;
    });
  }, [state.actividades, state.categoriaFilter, state.fechaAsignacion]);

  const getUserByDni = async (dni: number) => {
    try {
      const response = await apiClient.get(`/usuarios/search/dni/${dni}`);
      const userData = Array.isArray(response.data) ? response.data[0] : response.data;
      return userData ? userData.nombres + ' ' + userData.apellidos : 'N/A';
    } catch (error) {
      console.error('Error fetching user by DNI:', error);
      return 'N/A';
    }
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const handleFinalizeCultivo = async () => {
    if (!state.currentCultivo) return;
    console.log('Finalizing cultivo with id:', state.currentCultivo.id);
    try {
      await cultivosService.finalizeCultivo(state.currentCultivo.id);
      Alert.alert('Éxito', 'Cultivo finalizado');
      onClose();
    } catch (error) {
      console.log('Error finalizing cultivo:', error);
      Alert.alert('Error', 'Error al finalizar cultivo');
    }
  };

  const handleHarvest = () => {
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isHarvestSellModalVisible', value: false } });
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isCosechaModalVisible', value: true } });
  };

  const handleSell = () => {
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isHarvestSellModalVisible', value: false } });
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isVentaModalVisible', value: true } });
  };

  const handleFinalizeHarvest = () => {
    handleFinalizeCultivo();
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isHarvestSellModalVisible', value: false } });
  };

  const handleHarvestSellModalClose = () => {
    console.log('HarvestSellModal onClose called');
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isHarvestSellModalVisible', value: false } });
  };


  const renderTabButton = (tabKey: string, title: string) => (
    <TouchableOpacity
      key={tabKey}
      style={[styles.tabButton, state.activeTab === tabKey && styles.activeTabButton]}
      onPress={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tabKey })}
    >
      <Text style={[styles.tabText, state.activeTab === tabKey && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (!state.currentCultivo) return null;

  console.log('ModalCultivoDetalleO: about to render Modal, visible:', isVisible, 'currentCultivo:', state.currentCultivo?.nombrecultivo);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer} pointerEvents="auto">
          <View style={styles.header}>
            <Text style={styles.title}>Detalles del Cultivo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            {renderTabButton('actividades', 'Actividades')}
            {renderTabButton('detalles', 'Detalles')}
            {/*{renderTabButton('cosechas', 'Cosechas')}*/}
          </View>

          <ScrollView
            style={[styles.content, { flex: 1 }]}
            showsVerticalScrollIndicator={true}
            bounces={true}
            alwaysBounceVertical={true}
            pointerEvents="auto"
            contentContainerStyle={{ paddingBottom: 50 }}
          >
           {state.loading ? (
             <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color="#22c55e" />
               <Text style={styles.loadingText}>Cargando detalles...</Text>
             </View>
           ) : (
             <View style={styles.activityTableContainer}>
               {state.activeTab === 'detalles' && (
                 <View style={styles.tabContent}>
                   <View style={styles.activityTableContainer}>
                     <View style={styles.section}>
                       <Text style={styles.sectionTitle}>Detalles del Cultivo</Text>
                       <View style={styles.infoGrid}>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Ficha:</Text>
                           <Text style={styles.value}>{state.currentCultivo.ficha}</Text>
                         </View>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Lote:</Text>
                           <Text style={styles.value}>{state.currentCultivo.lote}</Text>
                         </View>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Nombre del Cultivo:</Text>
                           <Text style={styles.value}>
                             {state.currentCultivo.tipo_cultivo_nombre || state.currentCultivo.tipoCultivo?.nombre} {state.currentCultivo.nombrecultivo}
                           </Text>
                         </View>
                         <View style={{ flexDirection: 'row', gap: 12 }}>
                           <View style={[styles.infoItem, { flex: 1 }]}>
                             <Text style={styles.label}>Fecha de Siembra:</Text>
                             <Text style={styles.value}>
                               {state.currentCultivo.fechasiembra ? (() => {
                                 const [year, month, day] = state.currentCultivo.fechasiembra.split('-');
                                 return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
                               })() : 'No definida'}
                             </Text>
                           </View>
                           <View style={[styles.infoItem, { flex: 1 }]}>
                             <Text style={styles.label}>Fecha de Cosecha:</Text>
                             <Text style={styles.value}>
                               {state.currentCultivo.fechacosecha ? (() => {
                                 const [year, month, day] = state.currentCultivo.fechacosecha.split('-');
                                 return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
                               })() : 'No definida'}
                             </Text>
                           </View>
                         </View>
                       </View>
                     </View>

                     <View style={styles.section}>
                       <Text style={styles.sectionTitle}>Características del Cultivo</Text>
                       <View style={styles.infoGrid}>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Nombre del Cultivo:</Text>
                           <Text style={styles.value}>
                             {state.currentCultivo.tipo_cultivo_nombre || state.currentCultivo.tipoCultivo?.nombre} {state.currentCultivo.nombrecultivo}
                           </Text>
                         </View>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Edad del Cultivo:</Text>
                           <Text style={styles.value}>
                             {state.currentCultivo.fechasiembra ? `${calcularEdadCultivo(state.currentCultivo.fechasiembra)} días` : 'N/A'}
                           </Text>
                         </View>
                         <View style={{ flexDirection: 'row', gap: 12 }}>
                           <View style={[styles.infoItem, { flex: 1 }]}>
                             <Text style={styles.label}>Cantidad de Plantas Inicial:</Text>
                             <Text style={styles.value}>{state.currentCultivo.cantidad_plantas_inicial || 'N/A'}</Text>
                           </View>
                           <View style={[styles.infoItem, { flex: 1 }]}>
                             <Text style={styles.label}>Cantidad de Plantas Actual:</Text>
                             <Text style={styles.value}>{state.currentCultivo.cantidad_plantas_actual || 'N/A'}</Text>
                           </View>
                         </View>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Estado Fenológico:</Text>
                           <Text style={styles.value}>{state.currentCultivo.estado_fenologico_nombre || state.currentCultivo.estado_fenologico || 'N/A'}</Text>
                         </View>
                       </View>
                     </View>

                     <View style={styles.section}>
                       <View style={styles.infoGrid}>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Tipo:</Text>
                           <Text style={styles.value}>
                             {(() => {
                               try {
                                 return state.currentCultivo?.tipoCultivo?.esPerenne ? 'Perenne' : 'Transitorio';
                               } catch (error) {
                                 console.error('Error getting crop type:', error);
                                 return 'N/A';
                               }
                             })()}
                           </Text>
                         </View>
                         <View style={styles.infoItem}>
                           <Text style={styles.label}>Estado:</Text>
                           <Text style={[styles.value, state.currentCultivo.estado === 1 ? styles.statusActive : styles.statusFinished]}>
                             {state.currentCultivo.estado === 1 ? 'En Curso' : 'Finalizado'}
                           </Text>
                         </View>
                       </View>
                     </View>

                     {/*<View style={styles.section}>
                       <Text style={styles.sectionTitle}>Análisis Financiero</Text>
                       <View style={styles.financialSummary}>
                         <View style={styles.financialItem}>
                           <Text style={styles.financialLabel}>Total Ingresos</Text>
                           <Text style={[styles.financialValue, styles.incomeText]}>${calcularTotalIngresos().toFixed(2)}</Text>
                         </View>
                         <View style={styles.financialItem}>
                           <Text style={styles.financialLabel}>Total Gastos</Text>
                           <Text style={[styles.financialValue, styles.expenseText]}>${calcularTotalGastos().toFixed(2)}</Text>
                         </View>
                         <View style={styles.financialItem}>
                           <Text style={styles.financialLabel}>Ganancia Neta</Text>
                           <Text style={[styles.financialValue, styles.netText]}>${(calcularTotalIngresos() - calcularTotalGastos()).toFixed(2)}</Text>
                         </View>
                       </View>
                     </View>*/}
                   </View>
                 </View>
               )}

                {state.activeTab === 'actividades' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.sectionTitle}>Actividades del Cultivo ({filteredActividades.length})</Text>

                    {/* Filtros */}
                    <View style={styles.filtersContainer}>
                      <Text style={styles.label}>Filtrar por categoría</Text>
                      <TextInput
                        style={styles.smallTextInput}
                        placeholder="Escribe la categoría..."
                        value={state.categoriaFilter}
                        onChangeText={(value) => dispatch({ type: 'SET_FILTER', payload: { key: 'categoriaFilter', value } })}
                      />
                      <Text style={styles.label}>Filtrar por fecha de asignación</Text>
                      <TouchableOpacity
                        style={[styles.smallDatePicker, { marginTop: 8 }]}
                        onPress={() => {
                          dispatch({ type: 'SET_FILTER', payload: { key: 'datePickerTarget', value: 'fechaAsignacion' } });
                          dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'showDatePicker', value: true } });
                        }}
                      >
                        <Text style={styles.smallDatePickerText}>
                          {state.fechaAsignacion ? state.fechaAsignacion.split('-').reverse().join('/') : 'Seleccionar fecha'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => dispatch({ type: 'RESET_FILTERS' })}
                      >
                        <Text style={styles.clearButtonText}>Limpiar</Text>
                      </TouchableOpacity>
                    </View>
                    {state.actividades.length === 0 ? (
                      <Text style={styles.emptyText}>No hay actividades registradas</Text>
                    ) : (
                      <View style={styles.activityTableContainer}>
                        <View style={styles.activityTableHeader}>
                          <Text style={[styles.activityTableCell, styles.activityTableHeaderCell]}>Fecha Asig.</Text>
                          <Text style={[styles.activityTableCell, styles.activityTableHeaderCell]}>Categoría</Text>
                          <Text style={[styles.activityTableCell, styles.activityTableHeaderCell]}>Usuario Resp.</Text>
                          <Text style={[styles.activityTableCell, styles.activityTableHeaderCell]}>Zona</Text>
                          {/*<Text style={[styles.activityTableCell, styles.activityTableHeaderCell]}>Inventario Utilizado</Text>*/}
                        </View>
                        {filteredActividades.map((actividad) => (
                          <TouchableOpacity key={actividad.id} style={styles.activityTableRow} onPress={() => {
                            dispatch({ type: 'SET_SELECTED_ACTIVITY', payload: actividad });
                            dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isActivityDetailModalVisible', value: true } });
                          }}>
                            <Text style={styles.activityTableCell}>
                              {actividad.fechaAsignacion ? (() => {
                                const [year, month, day] = actividad.fechaAsignacion.split('-');
                                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
                              })() : 'N/A'}
                            </Text>
                            <Text style={styles.activityTableCell}>{actividad.categoria || 'N/A'}</Text>
                            <Text style={styles.activityTableCell}>{actividad.nombreResponsable || actividad.dniResponsable || 'N/A'}</Text>
                            <Text style={styles.activityTableCell}>{actividad.zona || 'N/A'}</Text>
                            {/*<Text style={styles.activityTableCell}>{getInventoryUsed(actividad)}</Text>
                            <Text style={styles.activityTableCell}>${calculateCostoManoObra(actividad).toFixed(2)}</Text>
                            <Text style={styles.activityTableCell}>${calculateCostoTotalActividad(actividad).toFixed(2)}</Text>*/}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/*{activeTab === 'cosechas' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.sectionTitle}>Historial de Cosechas ({cosechas.length})</Text>
                    {cosechas.length === 0 ? (
                      <Text style={styles.emptyText}>No hay cosechas registradas</Text>
                    ) : (
                      cosechas.map((cosecha) => (
                        <View key={cosecha.id} style={styles.harvestCard}>
                          <View style={styles.harvestHeader}>
                            <Text style={styles.harvestTitle}>Cosecha #{cosecha.id.slice(0, 8)}</Text>
                            <Text style={[styles.harvestStatus, cosecha.cerrado ? styles.statusClosed : styles.statusOpen]}>
                              {cosecha.cerrado ? 'Cerrada' : 'Abierta'}
                            </Text>
                          </View>
                          <View style={styles.harvestDetails}>
                            <Text style={styles.harvestInfo}>
                              Fecha: {cosecha.fecha ? new Date(cosecha.fecha).toLocaleDateString() : 'N/A'}
                            </Text>
                            <Text style={styles.harvestInfo}>
                              Cantidad: {cosecha.cantidad} {cosecha.unidadMedida}
                            </Text>
                            <Text style={styles.harvestInfo}>
                              Disponible: {cosecha.cantidadDisponible} {cosecha.unidadMedida}
                            </Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                )}*/}

        

   
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={state.isActivityDetailModalVisible}
        onClose={() => dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isActivityDetailModalVisible', value: false } })}
        activity={state.selectedActivityDetail as any}
        cultivo={state.currentCultivo}
        onFinalize={() => loadCultivoData(state.currentCultivo?.cvzid || '')}
      />

      {/* Harvest Sell Modal */}
      <HarvestSellModal
        isOpen={state.isHarvestSellModalVisible}
        onClose={handleHarvestSellModalClose}
        cultivo={state.currentCultivo}
        onHarvest={handleHarvest}
        onSell={handleSell}
        onFinalize={handleFinalizeHarvest}
      />

      {/* Cosecha Modal */}
      <CosechaModal
        isOpen={state.isCosechaModalVisible}
        onClose={() => dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isCosechaModalVisible', value: false } })}
        cvzId={state.currentCultivo?.cvzid || ''}
        onSuccess={() => {
          dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isCosechaModalVisible', value: false } });
          loadCultivoData(state.currentCultivo?.cvzid || '');
        }}
        cultivo={state.currentCultivo}
      />

      {/* Venta Modal */}
      <VentaModal
        isOpen={state.isVentaModalVisible}
        onClose={() => dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isVentaModalVisible', value: false } })}
        cultivo={state.currentCultivo}
        onSuccess={() => {
          dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'isVentaModalVisible', value: false } });
          loadCultivoData(state.currentCultivo?.cvzid || '');
        }}
      />

      {state.showDatePicker && (
        <DateTimePicker
          value={state[state.datePickerTarget] ? new Date(state[state.datePickerTarget]!) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { key: 'showDatePicker', value: false } });
            if (selectedDate && event.type !== 'dismissed') {
              const localDate = selectedDate.getFullYear() + '-' +
                (selectedDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
                selectedDate.getDate().toString().padStart(2, '0');
              dispatch({ type: 'SET_FILTER', payload: { key: state.datePickerTarget, value: localDate } });
            }
          }}
        />
      )}

    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '95%',
    height: '100%',
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
    padding: 12,
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#22c55e',
  },
  content: {
    padding: 6,
  },
  tabContent: {
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  infoItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  statusActive: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  statusFinished: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  activityStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  activityDetails: {
    gap: 4,
  },
  activityInfo: {
    fontSize: 14,
    color: '#374151',
  },
  harvestCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  harvestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  harvestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  harvestStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusClosed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusOpen: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  harvestDetails: {
    gap: 4,
  },
  harvestInfo: {
    fontSize: 14,
    color: '#374151',
  },
  financialSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  financialLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#22c55e',
  },
  expenseText: {
    color: '#ef4444',
  },
  netText: {
    color: '#22c55e',
  },
  saleCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  saleDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  saleDetails: {
    gap: 4,
  },
  saleInfo: {
    fontSize: 14,
    color: '#374151',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  // Nuevos estilos para las tarjetas financieras
  productionCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  productionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  productionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  productionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'right',
  },
  incomeCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  incomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  incomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  incomeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'right',
  },
  lossCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  lossHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lossIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  lossTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  lossValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'right',
  },
  costCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  costIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  costValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'right',
  },
  efficiencyCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  efficiencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  efficiencySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBarSecondary: {
    backgroundColor: '#3b82f6',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressTextSecondary: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  financialTable: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  finalRow: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  finalText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  efficiencySalesCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  efficiencySalesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  efficiencySalesValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  activityTableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  activityTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  activityTableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  activityTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityTableCell: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#22c55e',
    borderRadius: 6,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  filtersContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  dateFilterContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#374151',
  },
  clearDateButton: {
    position: 'absolute',
    right: 10,
    top: 18,
    padding: 5,
  },
  clearDateText: {
    fontSize: 20,
    color: '#ef4444',
  },
  dateFilters: {
    marginTop: 16,
  },
  dateFilterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  datePicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  smallDatePicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
  },
  smallDatePickerText: {
    fontSize: 12,
    color: '#374151',
  },
  smallTextInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 12,
  },
});

export default ModalCultivoDetalleO;