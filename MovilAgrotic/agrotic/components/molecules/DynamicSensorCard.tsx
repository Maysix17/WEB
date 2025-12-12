import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useMqttSocket } from '../../hooks/useMqttSocket';
import apiClient from '../../services/General/axios/axios';
import type { MedicionSensor } from '../../types/Modulo Sensores/Mediciones.types';

interface SensorReading {
  zona: string;
  sensorKey: string;
  value: number;
  unit: string;
  timestamp: string;
  mqttConfigId: string;
}

const DynamicSensorCard: React.FC = () => {
  const { lecturas, isConnected } = useMqttSocket();
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [zoneCache, setZoneCache] = useState<Map<string, string>>(new Map());

  // Throttling for API requests
  const lastApiCallRef = useRef<number>(0);
  const apiCallQueueRef = useRef<Promise<any>[]>([]);
  const processingQueueRef = useRef<boolean>(false);

  // Throttled API call function - ensures minimum delay between calls
  const throttledApiCall = useCallback(async (apiCall: () => Promise<any>, minDelay: number = 200): Promise<any> => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallRef.current;

    if (timeSinceLastCall < minDelay) {
      // Wait for the remaining time
      await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastCall));
    }

    lastApiCallRef.current = Date.now();
    return apiCall();
  }, []);

  // Load all active MQTT configurations and their sensor data
  const loadAllSensorData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get all active zona-mqtt-configs (only active connections) with throttling
      const response = await throttledApiCall(
        () => apiClient.get('/mqtt-config/active-zona-mqtt-configs'),
        500 // 500ms delay
      );
      const activeZonaMqttConfigs = response.data;
      console.log('Active zona MQTT configs:', activeZonaMqttConfigs);

      const allReadings: SensorReading[] = [];
      const newZoneCache = new Map(zoneCache);

      // Process configs with throttling to avoid rate limits
      for (let i = 0; i < activeZonaMqttConfigs.length; i++) {
        const zonaMqttConfig = activeZonaMqttConfigs[i];

        try {
          // Cache zone names
          if (zonaMqttConfig.zona?.nombre) {
            newZoneCache.set(zonaMqttConfig.fkZonaId, zonaMqttConfig.zona.nombre);
          }

          // Throttle the mediciones request
          const medicionesResponse = await throttledApiCall(
            () => apiClient.get(`/medicion-sensor/mqtt-config/${zonaMqttConfig.fkMqttConfigId}`),
            300 // 300ms delay between requests
          );
          const mediciones = medicionesResponse.data;
          console.log(`Mediciones for config ${zonaMqttConfig.mqttConfig?.nombre} in zone ${zonaMqttConfig.zona?.nombre}:`, mediciones);

          // Filter mediciones that belong to this specific zone
          const zoneMediciones = mediciones.filter((medicion: MedicionSensor) => medicion.fkZonaId === zonaMqttConfig.fkZonaId);

          zoneMediciones.forEach((medicion: MedicionSensor) => {
            allReadings.push({
              zona: zonaMqttConfig.zona?.nombre || 'Zona Desconocida',
              sensorKey: medicion.key,
              value: Number(medicion.valor),
              unit: medicion.unidad,
              timestamp: medicion.fechaMedicion,
              mqttConfigId: zonaMqttConfig.fkMqttConfigId,
            });
          });
        } catch (error) {
          console.error(`Error loading data for zona-mqtt-config:`, zonaMqttConfig, error);
        }
      }

      setSensorReadings(allReadings);
      setZoneCache(newZoneCache);
      console.log('All sensor readings loaded:', allReadings);
    } catch (error) {
      console.error('Error loading MQTT configurations:', error);
      // If loading fails, try to show cached data
      console.log('Using cached zone data for display');
    } finally {
      setIsLoading(false);
    }
  }, [zoneCache, throttledApiCall]);

  // Update sensor readings with real-time WebSocket data
  useEffect(() => {
    if (lecturas.length > 0) {
      console.log('Updating sensor readings with real-time data:', lecturas);

      // Process readings asynchronously
      const updateReadings = async () => {
        try {
          // Get zone names for all lecturas, using cache when possible
          const zonaNamesMap = new Map(zoneCache);

          // Only fetch zones not in cache
          const zonesToFetch = lecturas
            .filter(lectura => !zonaNamesMap.has(lectura.zonaId))
            .map(lectura => lectura.zonaId)
            .filter((value, index, self) => self.indexOf(value) === index); // unique

          if (zonesToFetch.length > 0) {
            console.log('Fetching zone names for:', zonesToFetch);

            // Try to fetch zones with throttling to avoid rate limits
            const fetchResults = await Promise.allSettled(
              zonesToFetch.map(async (zonaId, index) => {
                // Add delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, index * 100)); // 100ms delay between requests

                return throttledApiCall(async () => {
                  try {
                    const zonaMqttConfigsResponse = await apiClient.get(`/mqtt-config/zona/${zonaId}/configs`);
                    const zonaMqttConfigs = zonaMqttConfigsResponse.data;
                    const activeZonaMqttConfigs = zonaMqttConfigs.filter((zmc: any) => zmc.estado === true);
                    const zonaConfig = activeZonaMqttConfigs.find((zmc: any) => zmc.fkZonaId === zonaId);
                    const zonaNombre = zonaConfig?.zona?.nombre || 'Zona Desconocida';
                    return { zonaId, zonaNombre };
                  } catch (error) {
                    console.error('Error getting zone name for lectura:', zonaId, error);
                    return { zonaId, zonaNombre: 'Zona Desconocida' };
                  }
                }, 300); // 300ms minimum delay between API calls
              })
            );

            // Update the map with results
            fetchResults.forEach(result => {
              if (result.status === 'fulfilled') {
                zonaNamesMap.set(result.value.zonaId, result.value.zonaNombre);
              } else {
                // Even on rejection, set a default
                const zonaId = zonesToFetch.find(id => !zonaNamesMap.has(id));
                if (zonaId) {
                  zonaNamesMap.set(zonaId, 'Zona Desconocida');
                }
              }
            });

            // Update cache
            setZoneCache(new Map(zonaNamesMap));
          }

          // Now update the readings with the zone names
          setSensorReadings(prevReadings => {
            const updatedReadings = [...prevReadings];

            lecturas.forEach((lectura) => {
              const zonaNombre = zonaNamesMap.get(lectura.zonaId) || 'Zona Desconocida';

              lectura.mediciones.forEach((medicion) => {
                console.log('Processing medicion:', medicion);

                const existingIndex = updatedReadings.findIndex(
                  r => r.sensorKey === medicion.key && r.mqttConfigId === medicion.fkZonaMqttConfigId
                );

                const newReading: SensorReading = {
                  zona: zonaNombre,
                  sensorKey: medicion.key,
                  value: Number(medicion.valor),
                  unit: medicion.unidad,
                  timestamp: medicion.fechaMedicion,
                  mqttConfigId: medicion.fkZonaMqttConfigId,
                };

                console.log('New reading to add/update:', newReading);

                if (existingIndex >= 0) {
                  updatedReadings[existingIndex] = newReading;
                  console.log('Updated existing reading at index:', existingIndex);
                } else {
                  updatedReadings.push(newReading);
                  console.log('Added new reading');
                }
              });
            });

            return updatedReadings;
          });
        } catch (error) {
          console.error('Error updating sensor readings:', error);
        }
      };

      updateReadings();
    }
  }, [lecturas, zoneCache]);

  // Load initial data
  useEffect(() => {
    loadAllSensorData();
  }, [loadAllSensorData]);

  // Auto-rotate carousel every 10 seconds
  useEffect(() => {
    if (sensorReadings.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % sensorReadings.length);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [sensorReadings.length]);

  const nextReading = () => {
    if (sensorReadings.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sensorReadings.length);
    }
  };

  const prevReading = () => {
    if (sensorReadings.length > 1) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? sensorReadings.length - 1 : prevIndex - 1
      );
    }
  };

  const formatSensorKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const currentReading = sensorReadings[currentIndex];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Datos Ambientales</Text>
        <View style={[styles.connectionIndicator, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]}>
          <Text style={styles.connectionText}>{isConnected ? '● Conectado' : '● Desconectado'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {isLoading || (isConnected && sensorReadings.length === 0) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#066839" />
            <Text style={styles.loadingText}>
              {isLoading ? 'Cargando datos...' : 'Esperando datos...'}
            </Text>
          </View>
        ) : sensorReadings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay datos de sensores disponibles</Text>
            <Text style={styles.emptySubtext}>Verifica las configuraciones MQTT activas</Text>
          </View>
        ) : currentReading ? (
          <View style={styles.readingContainer}>
            <Text style={styles.zoneLabel}>ZONA DE CAPTURA</Text>
            <Text style={styles.zoneName}>{currentReading.zona}</Text>
            <Text style={styles.sensorValue}>
              {formatSensorKey(currentReading.sensorKey)}: {Number(currentReading.value).toFixed(2)} {currentReading.unit}
            </Text>
            <Text style={styles.timestamp}>
              Actualizado: {new Date(currentReading.timestamp).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </Text>
            {sensorReadings.length > 1 && (
              <Text style={styles.counter}>
                {currentIndex + 1} de {sensorReadings.length}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Cargando datos...</Text>
          </View>
        )}

        {/* Navigation Buttons */}
        {sensorReadings.length > 1 && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={prevReading}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonText}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={nextReading}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonText}>▼</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  connectionIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  cardBody: {
    position: 'relative',
    minHeight: 80,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  readingContainer: {
    alignItems: 'flex-start',
  },
  zoneLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#066839',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748b',
  },
  counter: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'column',
    gap: 4,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#066839',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default DynamicSensorCard;