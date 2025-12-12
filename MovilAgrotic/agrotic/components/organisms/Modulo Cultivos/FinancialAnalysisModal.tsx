import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Boton from '@/components/atoms/Boton';
import apiClient from '@/services/General/axios/axios';

interface FinanzasCosecha {
  id: string;
  fkCosechaId: string;
  cantidadCosechada: number;
  precioPorKilo: number;
  fechaVenta?: string;
  cantidadVendida: number;
  costoInventario: number;
  costoManoObra: number;
  costoTotalProduccion: number;
  ingresosTotales: number;
  ganancias: number;
  margenGanancia: number;
  fechaCalculo: string;
  cosecha?: {
    fecha?: string;
  };
}

interface FinancialAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivoId?: string;
}

const FinancialAnalysisModal: React.FC<FinancialAnalysisModalProps> = ({
  isOpen,
  onClose,
  cultivoId
}) => {
  const [finanzas, setFinanzas] = useState<FinanzasCosecha | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cultivoId) {
      loadFinancialData();
    }
  }, [isOpen, cultivoId]);

  const loadFinancialData = async () => {
    if (!cultivoId) return;

    setLoading(true);
    setError(null);
    try {
      let endpoint = '';

      // Verificar si el cultivo tiene cosechas para usar análisis dinámico o basado en actividades
      try {
        const cosechasResponse = await apiClient.get(`/cosechas/cultivo/${cultivoId}`);
        const cosechas = cosechasResponse.data;

        if (cosechas && cosechas.length > 0) {
          // Tiene cosechas, usar análisis dinámico completo
          endpoint = `/finanzas/cultivo/${cultivoId}/dinamico`;
        } else {
          // No tiene cosechas, usar análisis basado en actividades
          endpoint = `/finanzas/cultivo/${cultivoId}/actividades`;
        }
      } catch (cosechasError) {
        // Si no puede verificar cosechas, asumir análisis basado en actividades
        endpoint = `/finanzas/cultivo/${cultivoId}/actividades`;
      }

      if (endpoint) {
        const response = await apiClient.get(endpoint);
        setFinanzas(response.data);
      }
    } catch (err) {
      setError('Error al cargar los datos financieros');
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const pieData = finanzas ? [
    {
      name: 'Costos Prod.',
      population: finanzas.costoTotalProduccion,
      color: '#ef4444',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    ...(finanzas.ingresosTotales > 0 ? [{
      name: 'Ingresos',
      population: finanzas.ingresosTotales,
      color: '#10b981',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    }] : [])
  ] : [];

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Análisis Financiero</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Cargando análisis financiero...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : finanzas ? (
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Key Metrics */}
              <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>📦</Text>
                  <Text style={styles.metricLabel}>Producción</Text>
                  <Text style={styles.metricValue}>{formatNumber(finanzas.cantidadCosechada)} KG</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>💵</Text>
                  <Text style={styles.metricLabel}>Ingresos Totales</Text>
                  <Text style={styles.metricValue}>{formatCurrency(finanzas.ingresosTotales)}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>📈</Text>
                  <Text style={styles.metricLabel}>Perdidas</Text>
                  <Text style={styles.metricValue}>{formatCurrency(finanzas.ganancias)}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>💸</Text>
                  <Text style={styles.metricLabel}>Costo Total de Producción</Text>
                  <Text style={styles.metricValue}>{formatCurrency(finanzas.costoTotalProduccion)}</Text>
                </View>
              </View>

              {/* Pie Chart Representation */}
              <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>Total de Ingresos totales y Costos de produccion</Text>
                <PieChart
                  data={pieData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  hasLegend={false}
                />
                <View style={styles.legendContainer}>
                  {pieData.map((item, index) => {
                    const total = finanzas.costoTotalProduccion + finanzas.ingresosTotales;
                    const percentage = total > 0 ? ((item.population / total) * 100).toFixed(2) : '0.00';
                    return (
                      <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>{item.name}: {percentage}%</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.percentageContainer}>
                  <Text style={styles.percentageText}>
                  
                  </Text>
                  {finanzas.ingresosTotales > 0 && (
                    <Text style={styles.percentageText}>
                    </Text>
                  )}
                </View>
              </View>

              {/* Financial Details Table */}
              <View style={styles.tableSection}>
                <Text style={styles.sectionTitle}>Detalle Financiero</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Concepto</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Cantidad</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Valor Unitario</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Total</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Producción Cosechada</Text>
                    <Text style={styles.tableCell}>{formatNumber(finanzas.cantidadCosechada)} KG</Text>
                    <Text style={styles.tableCell}>{formatCurrency(finanzas.precioPorKilo)}/KG</Text>
                    <Text style={styles.tableCell}>{formatCurrency(finanzas.cantidadCosechada * finanzas.precioPorKilo)}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Cantidad Vendida</Text>
                    <Text style={styles.tableCell}>{formatNumber(finanzas.cantidadVendida)} KG</Text>
                    <Text style={styles.tableCell}>{formatCurrency(finanzas.precioPorKilo)}/KG</Text>
                    <Text style={styles.tableCell}>{formatCurrency(finanzas.ingresosTotales)}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Costo Inventario</Text>
                    <Text style={styles.tableCell}>-</Text>
                    <Text style={styles.tableCell}>-</Text>
                    <Text style={styles.tableCell}>{formatCurrency(finanzas.costoInventario)}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Costo Mano de Obra</Text>
                    <Text style={styles.tableCell}>-</Text>
                    <Text style={styles.tableCell}>-</Text>
                    <Text style={styles.tableCell}>{formatCurrency(finanzas.costoManoObra)}</Text>
                  </View>
                  <View style={[styles.tableRow, styles.finalRow]}>
                    <Text style={[styles.tableCell, styles.finalText]}>Resultado Final</Text>
                    <Text style={[styles.tableCell, styles.finalText]}>-</Text>
                    <Text style={[styles.tableCell, styles.finalText]}>-</Text>
                    <Text style={[styles.tableCell, styles.finalText]}>{finanzas.ganancias >= 0 ? '+' : ''}{formatCurrency(finanzas.ganancias)}</Text>
                  </View>
                </View>
              </View>

              {/* Sales Efficiency */}
              <View style={styles.efficiencySection}>
                <Text style={styles.sectionTitle}>Eficiencia de Ventas</Text>
                <Text style={styles.efficiencyValue}>{((finanzas.cantidadVendida / finanzas.cantidadCosechada) * 100).toFixed(1)}%</Text>
                <Text style={styles.efficiencyDetail}>{formatNumber(finanzas.cantidadVendida)} de {formatNumber(finanzas.cantidadCosechada)} KG vendidos</Text>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  scrollContent: {
    maxHeight: 400,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#374151',
  },
  pieChart: {
    flexDirection: 'row',
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  pieSlice: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  costSlice: {
    backgroundColor: '#ef4444',
  },
  incomeSlice: {
    backgroundColor: '#10b981',
  },
  pieText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  piePercent: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  tableSection: {
    marginBottom: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  finalRow: {
    backgroundColor: '#f0f9ff',
  },
  finalText: {
    fontWeight: 'bold',
    color: '#0369a1',
  },
  efficiencySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  efficiencyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  efficiencyDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  percentageContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
});

export default FinancialAnalysisModal;