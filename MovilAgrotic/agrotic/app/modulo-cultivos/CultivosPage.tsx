import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import MenuO from "@/components/organisms/General/MenuO";
import CampoTexto from "@/components/atoms/CampoTexto";
import ModalCultivoDetalleO from "@/components/organisms/Modulo Cultivos/ModalCultivoDetalleO";
import CultivoModal from "@/components/organisms/Modulo Cultivos/CultivoModal";
import TipoCultivoModal from "@/components/organisms/Modulo Cultivos/TipoCultivoModal";
import VariedadModal from "@/components/organisms/Modulo Cultivos/VariedadModal";
import CosechaModal from "@/components/organisms/Modulo Cultivos/CosechaModal";
import VentaModal from "@/components/organisms/Modulo Cultivos/VentaModal";
import HarvestSellModal from "@/components/organisms/Modulo Cultivos/HarvestSellModal";
import FinancialAnalysisModal from "@/components/organisms/Modulo Cultivos/FinancialAnalysisModal";
import EstadosFenologicosModal from "@/components/organisms/Modulo Cultivos/EstadosFenologicosModal";
import CustomAlertModal from "@/components/molecules/CustomAlertModal";
import { cultivosService } from "@/services/Modulo Cultivos/cultivosService";
import { usePermission } from "@/contexts/PermissionContext";
import type { ItemCultivo, FiltrosBusquedaCultivo } from "@/types/Modulo Cultivos/Cultivos.types";



const CultivosPage = () => {
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cultivos, setCultivos] = useState<ItemCultivo[]>([]);
  const [allCultivos, setAllCultivos] = useState<ItemCultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltrosBusquedaCultivo>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCultivoModalVisible, setIsCultivoModalVisible] = useState(false);
  const [isTipoCultivoModalVisible, setIsTipoCultivoModalVisible] = useState(false);
  const [isVariedadModalVisible, setIsVariedadModalVisible] = useState(false);
  const [isCosechaModalVisible, setIsCosechaModalVisible] = useState(false);
  const [isVentaModalVisible, setIsVentaModalVisible] = useState(false);
  const [isHarvestSellModalVisible, setIsHarvestSellModalVisible] = useState(false);
  const [isFinancialAnalysisModalVisible, setIsFinancialAnalysisModalVisible] = useState(false);
  const [isEstadosFenologicosModalVisible, setIsEstadosFenologicosModalVisible] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedCultivo, setSelectedCultivo] = useState<ItemCultivo | null>(null);
  const [selectedCultivoForDetails, setSelectedCultivoForDetails] = useState<ItemCultivo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil((cultivos?.length || 0) / pageSize);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'fecha_inicio' | 'fecha_fin'>('fecha_inicio');
  const [searchText, setSearchText] = useState(filters.buscar_cultivo || "");

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  const renderListHeader = () => {
    return (
      <Text style={styles.sectionTitle}>
        Cultivos ({cultivos?.length || 0})
        {(cultivos?.length || 0) > 0 && totalPages > 1 ? ` - Página ${currentPage} de ${totalPages}` : ''}
      </Text>
    );
  };

  const renderListFooter = () => {
    return (
      totalPages > 1 ? (
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
      ) : null
    );
  };


  useEffect(() => {
    loadCultivos();
  }, []);

  const loadCultivos = async () => {
    setLoading(true);
    try {
      console.log("Loading cultivos...");
      // Llamada al servicio cultivosService.getAll() para obtener todos los cultivos desde la API
      const data = await cultivosService.getAll();
      console.log("Cultivos data received:", data);
      setCultivos(data || []);
      setAllCultivos(data || []);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error loading cultivos:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCultivos();
    setRefreshing(false);
  };

  const handleFilterChange = (key: keyof FiltrosBusquedaCultivo, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const applyFilters = useCallback((currentFilters: FiltrosBusquedaCultivo) => {
    try {
      // Filter out empty values
      const cleanedFilters: Partial<FiltrosBusquedaCultivo> = {};
      Object.keys(currentFilters).forEach(key => {
        const value = currentFilters[key as keyof FiltrosBusquedaCultivo];
        if (value !== undefined && value !== null && value !== '') {
          (cleanedFilters as any)[key] = value;
        }
      });

      let filtered = [...allCultivos];

      // Apply filters locally
      if (cleanedFilters.buscar) {
        const search = normalizeText(cleanedFilters.buscar);
        filtered = filtered.filter(item =>
          normalizeText(item.lote || '').includes(search)
        );
      }

      if (cleanedFilters.buscar_cultivo) {
        const search = normalizeText(cleanedFilters.buscar_cultivo);
        filtered = filtered.filter(item =>
          normalizeText(item.nombrecultivo || '').includes(search) ||
          normalizeText(item.tipo_cultivo_nombre || '').includes(search)
        );
      }

      if (cleanedFilters.estado_cultivo !== undefined) {
        filtered = filtered.filter(item => item.estado === cleanedFilters.estado_cultivo);
      }

      if (cleanedFilters.fecha_inicio && cleanedFilters.fecha_fin) {
        const inicio = new Date(cleanedFilters.fecha_inicio);
        const fin = new Date(cleanedFilters.fecha_fin);
        filtered = filtered.filter(item => {
          if (!item.fechasiembra) return false;
          const fecha = new Date(item.fechasiembra);
          return fecha >= inicio && fecha <= fin;
        });
      }

      if (cleanedFilters.id_titulado) {
        const search = normalizeText(cleanedFilters.id_titulado);
        filtered = filtered.filter(item =>
          normalizeText(item.ficha || '').includes(search)
        );
      }

      setCultivos(filtered);
      setCurrentPage(1);
    } catch {
      setAlertTitle("Error");
      setAlertMessage("No se pudieron aplicar los filtros");
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  }, [allCultivos]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText !== filters.buscar_cultivo) {
        handleFilterChange("buscar_cultivo", searchText);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    if (allCultivos.length > 0) {
      if (filters.buscar_cultivo || filters.fecha_inicio || filters.fecha_fin) {
        applyFilters(filters);
      } else if (Object.keys(filters).length > 0) {
        setCultivos(allCultivos);
        setCurrentPage(1);
      }
    }
  }, [filters.buscar_cultivo, filters.fecha_inicio, filters.fecha_fin, applyFilters, allCultivos]);

  const clearFilters = () => {
    setFilters({});
    setSearchText("");
    setCultivos(allCultivos);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const handleCultivoAction = (cultivo: ItemCultivo, action: string) => {
    const nombreCultivo = cultivo.nombrecultivo || 'Cultivo sin nombre';
    console.log('handleCultivoAction called for cultivo:', nombreCultivo);

    setAlertTitle("Cultivos");
    setAlertMessage(`¿Qué deseas hacer con "${nombreCultivo}"?`);
    setAlertButtons([
      { text: "Ver Detalles", onPress: () => { console.log('Pressed Ver Detalles'); handleViewDetails(cultivo); setAlertVisible(false); } },
      { text: "Cosecha/Venta", onPress: () => { console.log('Pressed Cosecha/Venta'); handleOpenHarvestSellModal(cultivo); setAlertVisible(false); } },
      { text: "Análisis Financiero", onPress: () => { console.log('Pressed Análisis Financiero'); handleOpenFinancialAnalysisModal(cultivo); setAlertVisible(false); } },
      { text: "Cancelar", onPress: () => { console.log('Pressed Cancelar'); setAlertVisible(false); }, style: "cancel" },
    ]);
    setAlertVisible(true);
  };

  const handleViewDetails = (cultivo: ItemCultivo) => {
    console.log('handleViewDetails called for cultivo:', cultivo.nombrecultivo);
    // Close all other modals
    setIsHarvestSellModalVisible(false);
    setIsFinancialAnalysisModalVisible(false);
    setIsCosechaModalVisible(false);
    setIsVentaModalVisible(false);
    setIsEstadosFenologicosModalVisible(false);
    setSelectedCultivoForDetails(cultivo);
    setIsModalVisible(true);
    console.log('Opening ModalCultivoDetalleO');
  };

  const handleOpenHarvestSellModal = (cultivo: ItemCultivo) => {
    console.log('handleOpenHarvestSellModal called for cultivo:', cultivo.nombrecultivo);
    // Close all other modals
    setIsModalVisible(false);
    setIsFinancialAnalysisModalVisible(false);
    setIsCosechaModalVisible(false);
    setIsVentaModalVisible(false);
    setIsEstadosFenologicosModalVisible(false);
    setSelectedCultivo(cultivo);
    setIsHarvestSellModalVisible(true);
    console.log('Opening HarvestSellModal');
  };

  const handleOpenFinancialAnalysisModal = async (cultivo: ItemCultivo) => {
    console.log('handleOpenFinancialAnalysisModal called for cultivo:', cultivo.nombrecultivo);
    // Close all other modals
    setIsModalVisible(false);
    setIsHarvestSellModalVisible(false);
    setIsCosechaModalVisible(false);
    setIsVentaModalVisible(false);
    setIsEstadosFenologicosModalVisible(false);
    // Check if cultivo has activities
    try {
      // Llamada al servicio cultivosService.getActividadesByCultivo() para obtener actividades relacionadas con un cultivo específico
      const actividades = await cultivosService.getActividadesByCultivo(cultivo.cvzid);
      console.log('Actividades found:', actividades?.length);
      if (actividades && actividades.length > 0) {
        setSelectedCultivo(cultivo);
        setIsFinancialAnalysisModalVisible(true);
        console.log('Opening FinancialAnalysisModal');
      } else {
        setAlertTitle('Sin actividades');
        setAlertMessage('Este cultivo no tiene actividades registradas para análisis financiero.');
        setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
        setAlertVisible(true);
        console.log('No activities, showing alert');
      }
    } catch (error) {
      console.error('Error checking activities:', error);
      setAlertTitle('Error');
      setAlertMessage('Error al verificar actividades del cultivo.');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  };


  const handleFinalizeCultivo = async (cultivo: ItemCultivo) => {
    if (!cultivo?.id) {
      setAlertTitle('Error');
      setAlertMessage('ID del cultivo no válido');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }
    setAlertTitle('Confirmar');
    setAlertMessage('¿Estás seguro de finalizar este cultivo?\n\nEsta acción marcará el cultivo como finalizado y no se podrán registrar más actividades ni cosechas.');
    setAlertButtons([
      { text: 'Cancelar', onPress: () => setAlertVisible(false) },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await cultivosService.finalizeCultivo(cultivo.id);
            setAlertTitle('Éxito');
            setAlertMessage('Cultivo finalizado correctamente');
            setAlertButtons([{ text: 'OK', onPress: () => { setAlertVisible(false); loadCultivos(); } }]);
            setAlertVisible(true);
          } catch (error) {
            setAlertTitle('Error');
            setAlertMessage('Error al finalizar el cultivo');
            setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
            setAlertVisible(true);
          }
        },
      },
    ]);
    setAlertVisible(true);
  };

  const renderCultivoItem = ({ item }: { item: ItemCultivo }) => {
    if (!item) return null;

    console.log('renderCultivoItem called for item:', item.id || item.cvzid || 'no-id');

    const tipoCultivo = item.tipo_cultivo_nombre || item.tipoCultivo?.nombre || 'Tipo desconocido';
    const nombreCultivo = item.nombrecultivo || 'Sin nombre';
    const lote = item.lote || 'Sin lote';
    const ficha = item.ficha || 'Sin ficha';
    const fechaSiembra = item.fechasiembra ? (() => {
      const [year, month, day] = item.fechasiembra.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    })() : 'No definida';
    const fechaCosecha = item.fechacosecha ? (() => {
      const [year, month, day] = item.fechacosecha.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    })() : 'No definida';
    const estado = item.estado === 1 ? 'En Curso' : 'Finalizado';

    return (
      <TouchableOpacity
        style={styles.cultivoCard}
        onPress={() => handleCultivoAction(item, "view")}
      >
        <View style={styles.cultivoHeader}>
          <Text style={styles.cultivoTitle}>{tipoCultivo !== 'Tipo desconocido' ? tipoCultivo : nombreCultivo}</Text>
        </View>

        <View style={styles.cultivoDetails}>
          <Text style={styles.cultivoInfo}>Variedad: {nombreCultivo}</Text>
          <Text style={styles.cultivoInfo}>Lote: {lote}</Text>
          <Text style={styles.cultivoInfo}>Ficha: {ficha}</Text>
          <Text style={styles.cultivoInfo}>Siembra: {fechaSiembra}</Text>
          <Text style={styles.cultivoInfo}>Cosecha: {fechaCosecha}</Text>
          <Text style={[
            styles.cultivoStatus,
            item.estado === 1 ? styles.statusActive : styles.statusFinished
          ]}>
            {estado}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  console.log("CultivosPage rendering", {
    loading,
    error,
    cultivosLength: cultivos?.length || 0,
    currentPage,
    pageSize,
    showAddMenu,
    isModalVisible,
    isCultivoModalVisible,
    isTipoCultivoModalVisible,
    isVariedadModalVisible,
    isCosechaModalVisible,
    isVentaModalVisible,
    isHarvestSellModalVisible,
    isFinancialAnalysisModalVisible,
    isEstadosFenologicosModalVisible
  });

  // Mostrar menú de opciones cuando se presiona el botón +
  React.useEffect(() => {
    if (showAddMenu) {
      const buttons: any[] = [];

      // Agregar opciones basadas en permisos
      if (!isInitializing) {
        if (hasPermission('Cultivos', 'cultivos', 'crear')) {
          buttons.push({ text: "Cultivo", onPress: () => { setIsCultivoModalVisible(true); setShowAddMenu(false); setAlertVisible(false); } });
        }
        if (hasPermission('Cultivos', 'cultivos', 'leer')) {
          buttons.push({ text: "Tipo de Cultivo", onPress: () => { setIsTipoCultivoModalVisible(true); setShowAddMenu(false); setAlertVisible(false); } });
        }
        if (hasPermission('Cultivos', 'cultivos', 'leer')) {
          buttons.push({ text: "Variedad", onPress: () => { setIsVariedadModalVisible(true); setShowAddMenu(false); setAlertVisible(false); } });
        }
        if (hasPermission('Cultivos', 'cultivos', 'leer')) {
          buttons.push({ text: "Estados Fenológicos", onPress: () => { setIsEstadosFenologicosModalVisible(true); setShowAddMenu(false); setAlertVisible(false); } });
        }
      }

      // Agregar botón cancelar al final
      buttons.push({ text: "Cancelar", onPress: () => { setShowAddMenu(false); setAlertVisible(false); }, style: "cancel" });

      setAlertTitle("Agregar");
      setAlertMessage("Selecciona qué deseas agregar:");
      setAlertButtons(buttons);
      setAlertVisible(true);
    }
  }, [showAddMenu, hasPermission, isInitializing, lastUpdate]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Cultivos</Text>
        </View>
        <View style={styles.headerRight}>
          {!isInitializing && hasPermission('Cultivos', 'cultivos', 'leer') && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMenu(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>




      <View style={styles.filtersContainer}>
        {!isInitializing && hasPermission('Cultivos', 'cultivos', 'leer') && (
          <TouchableOpacity
            style={styles.moreOptionsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              setAlertTitle("Más opciones");
              setAlertMessage("Selecciona el estado");
              setAlertButtons([
                { text: "Todos", onPress: () => { handleFilterChange("estado_cultivo", undefined); setAlertVisible(false); } },
                { text: "En curso", onPress: () => { handleFilterChange("estado_cultivo", 1); setAlertVisible(false); } },
                { text: "Finalizado", onPress: () => { handleFilterChange("estado_cultivo", 0); setAlertVisible(false); } },
              ]);
              setAlertVisible(true);
            }}
          >
            <Text style={styles.moreOptionsText}>⋮</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Filtros de Búsqueda</Text>

        <CampoTexto
          etiqueta="Buscar por variedad o tipo de cultivo"
          marcador="Escribe para buscar..."
          valor={searchText}
          alCambiar={setSearchText}
          style={{ marginTop: 5, marginBottom: 5 }}
        />

        <View style={styles.dateFilters}>
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <View style={styles.dateLabelRow}>
                <Text style={styles.dateFilterLabel}>Fecha Inicio</Text>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    setDatePickerTarget('fecha_inicio');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.iconText}>F</Text>
                </TouchableOpacity>
              </View>
              {filters.fecha_inicio && (
                <Text style={styles.selectedDateText}>
                  {filters.fecha_inicio.split('-').reverse().join('/')}
                </Text>
              )}
            </View>
            <View style={styles.dateInputContainer}>
              <View style={styles.dateLabelRow}>
                <Text style={styles.dateFilterLabel}>Fecha Fin</Text>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    setDatePickerTarget('fecha_fin');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.iconText}>F</Text>
                </TouchableOpacity>
              </View>
              {filters.fecha_fin && (
                <Text style={styles.selectedDateText}>
                  {filters.fecha_fin.split('-').reverse().join('/')}
                </Text>
              )}
            </View>
          </View>
        </View>


        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearFilters}
        >
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando cultivos...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : cultivos.length === 0 ? (
        <Text style={styles.emptyText}>Sin resultados</Text>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <FlatList
          data={cultivos?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || []}
          renderItem={renderCultivoItem}
          keyExtractor={(item, index) => {
            // Ensure unique key by combining id/cvzid with index
            const baseKey = item?.id?.toString() || item?.cvzid?.toString() || `cultivo-${item?.lote || 'no-lote'}-${item?.ficha || 'no-ficha'}`;
            return `${baseKey}-${index}`;
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="always"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          />
        </KeyboardAvoidingView>
      )}


      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Modal de Detalles del Cultivo */}
      <ModalCultivoDetalleO
        isVisible={isModalVisible}
        onClose={() => {
          console.log('ModalCultivoDetalleO onClose called, setting isModalVisible to false');
          setIsModalVisible(false);
        }}
        cultivo={selectedCultivoForDetails}
      />

      {/* Modal de Crear Cultivo */}
      <CultivoModal
        isOpen={isCultivoModalVisible}
        onClose={() => setIsCultivoModalVisible(false)}
        onSuccess={() => {
          loadCultivos();
        }}
      />

      {/* Modal de Gestionar Tipos de Cultivo */}
      <TipoCultivoModal
        isOpen={isTipoCultivoModalVisible}
        onClose={() => setIsTipoCultivoModalVisible(false)}
        onSuccess={() => {
          // No necesitamos recargar cultivos aquí, pero podríamos recargar tipos si fuera necesario
        }}
        onShowAlert={(title, message, buttons) => {
          setAlertTitle(title);
          setAlertMessage(message);
          setAlertButtons(buttons);
          setAlertVisible(true);
        }}
        onCloseAlert={() => setAlertVisible(false)}
      />

      {/* Modal de Gestionar Variedades */}
      <VariedadModal
        isOpen={isVariedadModalVisible}
        onClose={() => setIsVariedadModalVisible(false)}
        onSuccess={() => {
          // No necesitamos recargar cultivos aquí, pero podríamos recargar variedades si fuera necesario
        }}
      />

      {/* Modal de Cosecha */}
      <CosechaModal
        isOpen={isCosechaModalVisible}
        onClose={() => setIsCosechaModalVisible(false)}
        cvzId={selectedCultivo?.cvzid || ""}
        onSuccess={loadCultivos}
        isPerenne={selectedCultivo?.tipoCultivo?.esPerenne || false}
        cultivo={selectedCultivo}
      />

      {/* Modal de Venta */}
      <VentaModal
        isOpen={isVentaModalVisible}
        onClose={() => setIsVentaModalVisible(false)}
        cultivo={selectedCultivo}
        onSuccess={loadCultivos}
      />

      {/* Modal de Cosecha/Venta */}
      <HarvestSellModal
        key={selectedCultivo?.id || 'no-cultivo'}
        isOpen={isHarvestSellModalVisible}
        onClose={() => setIsHarvestSellModalVisible(false)}
        cultivo={selectedCultivo}
        onHarvest={() => setIsCosechaModalVisible(true)}
        onSell={() => setIsVentaModalVisible(true)}
        onFinalize={() => selectedCultivo && handleFinalizeCultivo(selectedCultivo)}
        onShowAlert={(title, message, buttons) => {
          setAlertTitle(title);
          setAlertMessage(message);
          setAlertButtons(buttons);
          setAlertVisible(true);
        }}
        onCloseAlert={() => setAlertVisible(false)}
      />


      {/* Modal de Análisis Financiero */}
      <FinancialAnalysisModal
        isOpen={isFinancialAnalysisModalVisible}
        onClose={() => setIsFinancialAnalysisModalVisible(false)}
        cultivoId={selectedCultivo?.cvzid}
      />

      {/* Modal de Estados Fenológicos */}
      <EstadosFenologicosModal
        isOpen={isEstadosFenologicosModalVisible}
        onClose={() => setIsEstadosFenologicosModalVisible(false)}
        onSuccess={() => {
          // No necesitamos recargar cultivos aquí, pero podríamos recargar estados si fuera necesario
        }}
        onShowAlert={(title, message, buttons) => {
          setAlertTitle(title);
          setAlertMessage(message);
          setAlertButtons(buttons);
          setAlertVisible(true);
        }}
        onCloseAlert={() => setAlertVisible(false)}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={filters[datePickerTarget] ? new Date(filters[datePickerTarget]!) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && event.type !== 'dismissed') {
              const localDate = selectedDate.getFullYear() + '-' +
                (selectedDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
                selectedDate.getDate().toString().padStart(2, '0');
              handleFilterChange(datePickerTarget, localDate);
            }
          }}
        />
      )}

    </View>
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  addButton: {
    padding: 8,
  },
  addButtonText: {
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "bold",
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
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  exportActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cultivosContainer: {
    flex: 1,
  },
  cultivosList: {
    flex: 1,
  },
  cultivoCard: {
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
  cultivoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cultivoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  cultivoFicha: {
    fontSize: 14,
    color: "#6b7280",
  },
  cultivoDetails: {
    marginBottom: 12,
  },
  cultivoInfo: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  cultivoStatus: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusFinished: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  cultivoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  floatingMenuButton: {
    position: "absolute",
    top: 45,
    left: 16,
    backgroundColor: "#f3f4f6",
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
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#ef4444",
    padding: 20,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "#066839",
    borderColor: "#066839",
  },
  statusButtonText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusButtonTextActive: {
    color: "#ffffff",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
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
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    right: 10,
    top: 35, // Adjust based on the CampoTexto height
    padding: 5,
  },
  searchIconText: {
    fontSize: 18,
  },
  clearButton: {
    marginTop: 10,
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
    marginTop: 5,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  dateColumn: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  dateInputContainer: {
    // flex: 1, removed to allow space-between
  },
  datePickerWide: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 5,
    height: 80,
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
    height: 50,
  },
  smallDatePickerText: {
    fontSize: 14,
    color: '#374151',
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
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
});

export default CultivosPage;