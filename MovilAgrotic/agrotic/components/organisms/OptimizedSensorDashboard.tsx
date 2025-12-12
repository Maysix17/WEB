import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { zonaService } from '../../services/Modulo Zonas/zonaService';
import { useMqttSocket } from '../../hooks/useMqttSocket';
import { useDebounce } from '../../hooks/useDebounce';
import { usePermission } from '../../contexts/PermissionContext';

const DEBOUNCE_DELAY = 0; // Immediate UI updates
const MQTT_DEBOUNCE_DELAY = 0; // Immediate MQTT updates

interface SensorData {
  [key: string]: {
    unit: string;
    history: { value: number; timestamp: string; zonaId: string; cultivoNombres?: string[] }[];
    lastValue: number;
    lastUpdate: string;
    zonaNombre: string;
    cultivoNombres?: string[];
  };
}

// Sensor Card Component
const SensorCard = ({ sensorKey, lastValue, unit, zonaNombre, cultivoNombres, lastUpdate }: { sensorKey: string; lastValue: number; unit: string; zonaNombre: string; cultivoNombres?: string[]; lastUpdate: string }) => {
  const formatSensorKey = useCallback((key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }, []);

  // Memoize expensive computations
  const formattedValue = Number(lastValue).toFixed(2);
  const formattedCrops = cultivoNombres?.join(', ') || '';

  // Absolute time display matching web version
  const formattedUpdate = new Date(lastUpdate).toLocaleString();

  return (
    <View style={styles.sensorCard}>
      <View style={styles.sensorHeader}>
        <Text style={styles.sensorName}>{formatSensorKey(sensorKey)}</Text>
        <View style={styles.statusIndicator} />
      </View>

      <View style={styles.sensorDetails}>
        <Text style={styles.sensorZone}>{zonaNombre}</Text>
        {formattedCrops && (
          <Text style={styles.sensorCrops}>Cultivos: {formattedCrops}</Text>
        )}
      </View>

      <View style={styles.sensorValueContainer}>
        <Text key={lastValue.toString()} style={styles.sensorValue}>
          {formattedValue} <Text key={unit} style={styles.sensorUnit}>{unit}</Text>
        </Text>
        <Text key={lastUpdate} style={styles.sensorLastUpdate}>
          Última actualización: {formattedUpdate}
        </Text>
      </View>
    </View>
  );
};



const OptimizedSensorDashboard: React.FC = () => {
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [zonas, setZonas] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const { lecturas, isConnected } = useMqttSocket();
  const [trigger, setTrigger] = useState(0);
  const latestSensorData = useRef<SensorData>({});

  // Trigger update when lecturas changes
  useEffect(() => {
    console.log('Trigger useEffect running, lecturas.length:', lecturas.length);
    if (lecturas.length > 0) {
      setTrigger(t => t + 1);
    }
  }, [lecturas.length]);

  // Load zonas only (no historical sensor data)
  useEffect(() => {
    if (!isInitializing && hasPermission('IoT', 'iot', 'leer')) {
      loadZonas();
    }
  }, [isInitializing, hasPermission, lastUpdate]);

  // Clear sensor data when MQTT disconnects to avoid showing old data
  useEffect(() => {
    if (!isConnected) {
      setSensorData({});
    }
  }, [isConnected]);

  const applyFilters = (data: SensorData): SensorData => {
    const filtered: SensorData = {};
    
    Object.entries(data).forEach(([key, sensor]) => {
      filtered[key] = sensor;
    });

    return filtered;
  };

  // Real-time display updates
  const filteredSensorData = useMemo(() => applyFilters(sensorData), [sensorData]);
  const chartFilteredSensorData = useMemo(() => applyFilters(sensorData), [sensorData]);

  // Update sensor data from MQTT
  useEffect(() => {
    console.log('SensorData useEffect running, trigger:', trigger);
    if (lecturas.length > 0) {
      setSensorData(prevData => {
        const newData = { ...prevData };
        let hasNewData = false;
        // Sort lecturas by timestamp to ensure chronological processing
        const sortedLecturas = [...lecturas].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        sortedLecturas.forEach((lectura: any) => {
          // Find zona for this lectura
          const zona = zonas.find(z => z.id === lectura.zonaId);
          console.log('Processing lectura zonaId:', lectura.zonaId, 'zona found:', !!zona);
          if (!zona) {
            console.log('Zona not found for zonaId:', lectura.zonaId, 'available zonas:', zonas.map(z => z.id));
            return;
          }

          const cultivoNombres = zona.cultivosVariedad?.map((cv: any) => cv.cultivoXVariedad?.variedad?.tipoCultivo?.nombre).filter(Boolean) as string[];

          // Process each medicion in the lectura
          lectura.mediciones.forEach((medicion: any) => {
            const key = medicion.key;
            if (!newData[key]) {
              newData[key] = {
                unit: medicion.unidad,
                history: [],
                lastValue: medicion.valor,
                lastUpdate: lectura.timestamp,
                zonaNombre: zona.nombre,
                cultivoNombres,
              };
              hasNewData = true;
            }

            // Add to history
            newData[key].history.unshift({
              value: medicion.valor,
              timestamp: lectura.timestamp,
              zonaId: lectura.zonaId,
              cultivoNombres
            });

            // Keep only last 50
            if (newData[key].history.length > 50) {
              newData[key].history = newData[key].history.slice(0, 50);
            }

            // Update last value
            newData[key].lastValue = medicion.valor;
            newData[key].lastUpdate = lectura.timestamp;
            hasNewData = true;
          });
        });
        if (hasNewData) {
          latestSensorData.current = newData;
          console.log('Updated latestSensorData with new values', Object.keys(newData).map(k => [k, newData[k].lastValue]));
        }
        return prevData; // Don't update state here
      });
    }
  }, [trigger, zonas]);

  // Update UI every 5 minutes with latest data
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(latestSensorData.current).length > 0) {
        setSensorData(latestSensorData.current);
        setIsDataLoaded(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Load only zonas, no historical sensor data
  const loadZonas = async () => {
    setIsLoading(true);
    try {
      const zonasData = await zonaService.getAll();
      setZonas(zonasData);
      // Don't load historical sensor data - only wait for real-time MQTT data
    } catch (error) {
      console.error('Error loading zonas:', error);
      Alert.alert('Error', 'No se pudieron cargar las zonas');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSensor = useCallback((key: string) => {
    setSelectedSensors(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);

  const sensorEntries = useMemo(() => Object.entries(filteredSensorData || {}), [filteredSensorData]);
  const displayedSensorEntries = useMemo(() => {
    const result = selectedSensors.length > 0 ? sensorEntries.filter(([key]) => selectedSensors.includes(key)) : sensorEntries;
    console.log('displayedSensorEntries updated', result.map(([k, d]) => [k, d.lastValue]));
    return result;
  }, [sensorEntries, selectedSensors]);

  useEffect(() => {
    if (displayedSensorEntries.length > 0) {
      setCurrentIndex(prev => Math.min(prev, Math.max(0, displayedSensorEntries.length - 4)));
    }
  }, [displayedSensorEntries]);

  // Use the same data for chart to ensure synchronization
  const chartDisplayedSensorEntries = displayedSensorEntries;

  const chartData = useMemo(() => {
    if (chartDisplayedSensorEntries.length === 0) return null;

    // Get all timestamps
    const allTimestamps = new Set<string>();
    chartDisplayedSensorEntries.forEach(([, sensor]) => {
      sensor.history.forEach(point => allTimestamps.add(point.timestamp));
    });

    if (allTimestamps.size === 0) return null;

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const datasets = chartDisplayedSensorEntries.map(([key, sensor], index) => {
      const data = sortedTimestamps.map(timestamp => {
        const point = sensor.history.find(h => h.timestamp === timestamp);
        return point ? Number(point.value) : 0; // Ensure it's a number
      });

      // Only include datasets with actual data
      if (data.some(val => val !== 0)) {
        // Generate distinct colors for each sensor
        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        const color = colors[index % colors.length];

        return {
          data,
          color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          strokeWidth: 3,
        };
      }
      return null;
    }).filter(dataset => dataset !== null);

    if (datasets.length === 0) return null;

    // Reduce labels to avoid overcrowding - show max 5 labels
    const maxLabels = 5;
    const step = Math.max(1, Math.floor(sortedTimestamps.length / maxLabels));
    const reducedLabels = sortedTimestamps.filter((_, index) => index % step === 0);
    const labels = reducedLabels.map(timestamp => {
      const date = new Date(timestamp);
      // Format as HH:MM for better readability
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    // Adjust data to match reduced labels
    const adjustedDatasets = datasets.map(dataset => ({
      ...dataset,
      data: sortedTimestamps
        .filter((_, index) => index % step === 0)
        .map((timestamp, index) => dataset.data[index * step] || 0)
    }));

    return {
      labels,
      datasets: adjustedDatasets,
    };
  }, [chartDisplayedSensorEntries]);



  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 4));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(displayedSensorEntries.length - 4, prev + 4));
  }, [displayedSensorEntries.length]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {isInitializing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#066839" />
            <Text style={styles.loadingText}>Cargando permisos...</Text>
          </View>
        ) : (
          <View style={styles.dashboardContent}>
            {/* Sensor Cards Carousel */}
            <View style={styles.carouselContainer}>
              <Text style={styles.sectionTitle}>Sensores</Text>
              {!hasPermission('IoT', 'iot', 'leer') ? (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No tienes permisos para ver los datos de sensores</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#066839" />
                  <Text style={styles.loadingText}>Cargando zonas...</Text>
                </View>
              ) : !isDataLoaded ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#066839" />
                  <Text style={styles.loadingText}>Cargando datos de sensores...</Text>
                </View>
              ) : sensorEntries.length === 0 ? (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    Esperando datos en tiempo real... Los sensores aparecerán aquí cuando envíen información.
                  </Text>
                  <Text style={styles.connectionText}>
                    Estado de conexión MQTT: {isConnected ? 'Conectado' : 'Desconectado'}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.carousel}>
                    <FlatList
                      horizontal
                      data={displayedSensorEntries.slice(currentIndex, currentIndex + 4)}
                      extraData={Math.random()}
                      renderItem={({ item: [key, data] }) => {
                        console.log('renderItem data', key, data.lastValue);
                        return <SensorCard key={`${key}-${data.lastUpdate}`} sensorKey={key} lastValue={data.lastValue} unit={data.unit} zonaNombre={data.zonaNombre} cultivoNombres={data.cultivoNombres} lastUpdate={data.lastUpdate} />;
                      }}
                      keyExtractor={([key, data]) => `${key}-${data.lastUpdate}`}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.carouselContent}
                    />
                  </View>
                  {displayedSensorEntries.length > 4 && (
                    <View style={styles.carouselControls}>
                      <TouchableOpacity
                        style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]}
                        onPress={handlePrev}
                        disabled={currentIndex === 0}
                      >
                        <Text style={styles.controlButtonText}>‹</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.controlButton, currentIndex >= displayedSensorEntries.length - 4 && styles.controlButtonDisabled]}
                        onPress={handleNext}
                        disabled={currentIndex >= displayedSensorEntries.length - 4}
                      >
                        <Text style={styles.controlButtonText}>›</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Gráfica de Sensores</Text>
              {!hasPermission('IoT', 'iot', 'leer') ? (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No tienes permisos para ver las gráficas de sensores</Text>
                </View>
              ) : !isDataLoaded ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#066839" />
                  <Text style={styles.loadingText}>Cargando gráfica de sensores...</Text>
                  <Text style={styles.connectionText}>
                    Estado de conexión MQTT: {isConnected ? 'Conectado' : 'Desconectado'}
                  </Text>
                </View>
              ) : chartData ? (
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 32}
                    height={280}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#f8fafc',
                      decimalPlaces: 2,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForLabels: {
                        fontSize: 10,
                        rotation: -45,
                      },
                      propsForDots: {
                        r: '3',
                        strokeWidth: '1',
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '5, 5',
                        stroke: '#e2e8f0',
                      },
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={true}
                    withOuterLines={true}
                    withDots={false}
                    withShadow={false}
                    fromZero={true}
                    segments={4}
                  />
                  <View style={styles.legendContainer}>
                    {displayedSensorEntries.map(([key], index) => {
                      const colors = [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <TouchableOpacity
                          key={key}
                          style={[styles.legendItem, selectedSensors.includes(key) && styles.legendItemSelected]}
                          onPress={() => toggleSensor(key)}
                        >
                          <View
                            style={[styles.legendColor, { backgroundColor: color }]}
                          />
                          <Text style={styles.legendText}>
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity style={styles.clearButton} onPress={() => setSelectedSensors([])}>
                      <Text style={styles.clearButtonText}>Limpiar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No hay datos suficientes para mostrar la gráfica</Text>
                  <Text style={styles.connectionText}>
                    Esperando datos en tiempo real vía MQTT...
                  </Text>
                  <Text style={styles.connectionText}>
                    Estado de conexión MQTT: {isConnected ? 'Conectado' : 'Desconectado'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  dashboardContent: {
    gap: 20,
  },
  carouselContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  carousel: {
    marginBottom: 16,
  },
  carouselContent: {
    gap: 12,
  },
  carouselControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: '#e5e7eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  controlButtonText: {
    fontSize: 20,
    color: '#066839',
    fontWeight: 'bold',
  },
  sensorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#066839',
  },
  sensorDetails: {
    marginBottom: 12,
  },
  sensorZone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  sensorCrops: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sensorValueContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#066839',
    marginBottom: 4,
  },
  sensorUnit: {
    fontSize: 14,
    color: '#075985',
  },
  sensorLastUpdate: {
    fontSize: 10,
    color: '#6b7280',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    paddingBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    marginBottom: 40,
    alignSelf: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendItemSelected: {
    borderColor: '#066839',
    backgroundColor: '#f0f9ff',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  connectionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default OptimizedSensorDashboard;