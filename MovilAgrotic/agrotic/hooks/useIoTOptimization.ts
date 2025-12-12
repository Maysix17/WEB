import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMqttSocket } from './useMqttSocket';
import { zonaService } from '../services/Modulo Zonas/zonaService';
import type {
  LecturaNueva,
  EstadoMqtt,
  MedicionSensor as MedicionSensorType
} from '../types/Modulo Sensores/Mediciones.types';

/**
 * Hook optimizado para el módulo IoT que maneja:
 * - Control de frecuencia de actualizaciones
 * - Agregación de datos de sensores
 * - Gestión de memoria para datos históricos
 * - Throttling de renders
 */

// Configuración por defecto para optimización IoT
const DEFAULT_IOT_CONFIG = {
  MAX_LECTURAS_MEMORY: 100,        // Máximo de lecturas en memoria
  UPDATE_THROTTLE_MS: 1000,        // Throttle de 1 segundo para updates
  AGGREGATION_INTERVAL_MS: 5000,   // Agregar datos cada 5 segundos
  CLEANUP_INTERVAL_MS: 30000,      // Limpiar datos cada 30 segundos
  SENSOR_THRESHOLD: 0.1,           // Umbral para cambios significativos
  MAX_RENDER_FREQUENCY: 10,        // Máximo 10 renders por segundo
};

interface IoTOptimizationConfig {
  maxLecturasMemory?: number;
  updateThrottleMs?: number;
  aggregationIntervalMs?: number;
  cleanupIntervalMs?: number;
  sensorThreshold?: number;
  maxRenderFrequency?: number;
}

interface AggregatedSensorData {
  key: string;
  promedio: number;
  minimo: number;
  maximo: number;
  ultimoValor: number;
  unidad: string;
  totalMediciones: number;
  timestamp: string;
}

interface OptimizedSensorData {
  zonaId: string;
  datosAgregados: AggregatedSensorData[];
  ultimaActualizacion: string;
  totalSensores: number;
  sensoresActivos: number;
}

/**
 * Hook principal para optimización IoT
 */
export const useIoTOptimization = (config: IoTOptimizationConfig = {}) => {
  const finalConfig = { ...DEFAULT_IOT_CONFIG, ...config };
  
  // Estados principales
  const [isConnected, setIsConnected] = useState(false);
  const [optimizedData, setOptimizedData] = useState<Map<string, OptimizedSensorData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referencias para control
  const lastUpdateRef = useRef<Map<string, number>>(new Map());
  const renderCountRef = useRef<Map<string, number>>(new Map());
  const aggregationTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const dataBufferRef = useRef<Map<string, MedicionSensorType[]>>(new Map());

  // Uso del hook WebSocket con configuración optimizada
  const {
    isConnected: socketConnected,
    isConnecting: socketConnecting,
    connectionError: socketError,
    lecturas,
    estadosMqtt,
    clearLecturas,
    reconnect: socketReconnect,
    config: socketConfig
  } = useMqttSocket({
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    heartbeatInterval: 25000,
    maxLecturas: 200,
  });

  // Conexión status y error handling
  useEffect(() => {
    setIsConnected(socketConnected);
    if (socketError) {
      setError(socketError);
    } else {
      setError(null);
    }
  }, [socketConnected, socketError]);
  
  // Loading state basado en conexión
  useEffect(() => {
    setLoading(socketConnecting);
  }, [socketConnecting]);

  // Control de frecuencia para updates
  const canUpdateZona = useCallback((zonaId: string): boolean => {
    const now = Date.now();
    const lastUpdate = lastUpdateRef.current.get(zonaId) || 0;
    const timeDiff = now - lastUpdate;
    
    if (timeDiff >= (finalConfig.updateThrottleMs || DEFAULT_IOT_CONFIG.UPDATE_THROTTLE_MS)) {
      lastUpdateRef.current.set(zonaId, now);
      return true;
    }
    
    return false;
  }, [finalConfig.updateThrottleMs]);

  // Control de frecuencia de renders
  const canRenderZona = useCallback((zonaId: string): boolean => {
    const now = Date.now();
    const lastRender = renderCountRef.current.get(zonaId) || 0;
    const timeDiff = now - lastRender;
    const maxRenderFreq = finalConfig.maxRenderFrequency || DEFAULT_IOT_CONFIG.MAX_RENDER_FREQUENCY;
    const minInterval = 1000 / maxRenderFreq; // ms entre renders
    
    if (timeDiff >= minInterval) {
      renderCountRef.current.set(zonaId, now);
      return true;
    }
    
    return false;
  }, [finalConfig.maxRenderFrequency]);

  // Agregación inteligente de datos de sensores
  const aggregateSensorData = useCallback((zonaId: string, mediciones: MedicionSensorType[]): AggregatedSensorData[] => {
    const groupedData = new Map<string, MedicionSensorType[]>();
    
    // Agrupar por key del sensor
    mediciones.forEach(medicion => {
      if (!groupedData.has(medicion.key)) {
        groupedData.set(medicion.key, []);
      }
      groupedData.get(medicion.key)!.push(medicion);
    });

    const aggregated: AggregatedSensorData[] = [];
    const threshold = finalConfig.sensorThreshold || DEFAULT_IOT_CONFIG.SENSOR_THRESHOLD;

    groupedData.forEach((medicionesSensor, key) => {
      const valores = medicionesSensor.map(m => m.valor);
      const ultimoValor = valores[valores.length - 1];
      
      // Solo agregar si hay cambio significativo
      const existingData = optimizedData.get(zonaId);
      const existingSensor = existingData?.datosAgregados.find(d => d.key === key);
      
      if (existingSensor && Math.abs(existingSensor.ultimoValor - ultimoValor) < threshold) {
        // Cambio no significativo, mantener datos existentes
        aggregated.push(existingSensor);
      } else {
        // Cambio significativo o datos nuevos
        aggregated.push({
          key,
          promedio: valores.reduce((sum, val) => sum + val, 0) / valores.length,
          minimo: Math.min(...valores),
          maximo: Math.max(...valores),
          ultimoValor,
          unidad: medicionesSensor[0].unidad,
          totalMediciones: medicionesSensor.length,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return aggregated;
  }, [optimizedData, finalConfig.sensorThreshold]);

  // Procesamiento optimizado de nuevas lecturas
  const processNewReading = useCallback((lectura: LecturaNueva) => {
    if (!canUpdateZona(lectura.zonaId)) {
      console.log(`IoT Optimization: Update throttled for zona ${lectura.zonaId}`);
      return;
    }

    // Agregar al buffer
    const currentBuffer = dataBufferRef.current.get(lectura.zonaId) || [];
    const updatedBuffer = [...lectura.mediciones, ...currentBuffer]
      .slice(0, finalConfig.maxLecturasMemory);
    dataBufferRef.current.set(lectura.zonaId, updatedBuffer);

    // Agregar datos si es necesario
    const shouldAggregate = aggregationTimeoutRef.current.has(lectura.zonaId);
    if (!shouldAggregate) {
      const timeoutId = setTimeout(() => {
        aggregationTimeoutRef.current.delete(lectura.zonaId);
        aggregateAndUpdate(lectura.zonaId);
      }, finalConfig.aggregationIntervalMs);
      
      aggregationTimeoutRef.current.set(lectura.zonaId, timeoutId);
    }
  }, [canUpdateZona, finalConfig]);

  // Agregar y actualizar datos optimizados
  const aggregateAndUpdate = useCallback((zonaId: string) => {
    const buffer = dataBufferRef.current.get(zonaId) || [];
    if (buffer.length === 0) return;

    const datosAgregados = aggregateSensorData(zonaId, buffer);
    const zonaActiva = estadosMqtt.find(e => e.zonaId === zonaId && e.conectado);
    
    const optimizedZoneData: OptimizedSensorData = {
      zonaId,
      datosAgregados,
      ultimaActualizacion: new Date().toISOString(),
      totalSensores: datosAgregados.length,
      sensoresActivos: zonaActiva ? datosAgregados.length : 0,
    };

    setOptimizedData(prev => {
      const newMap = new Map(prev);
      newMap.set(zonaId, optimizedZoneData);
      return newMap;
    });

    // Limpiar buffer
    dataBufferRef.current.set(zonaId, []);
  }, [aggregateSensorData, estadosMqtt]);

  // Efecto para procesar nuevas lecturas del WebSocket
  useEffect(() => {
    lecturas.forEach(lectura => {
      processNewReading(lectura);
    });
  }, [lecturas, processNewReading]);

  // Limpieza automática de datos antiguos
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const cleanupMs = finalConfig.cleanupIntervalMs || DEFAULT_IOT_CONFIG.CLEANUP_INTERVAL_MS;
      
      // Limpiar datos antiguos
      setOptimizedData(prev => {
        const newMap = new Map();
        prev.forEach((data, zonaId) => {
          const lastUpdate = lastUpdateRef.current.get(zonaId) || 0;
          if (now - lastUpdate < cleanupMs * 2) {
            newMap.set(zonaId, data);
          }
        });
        return newMap;
      });

      // Limpiar buffers
      dataBufferRef.current.forEach((buffer, zonaId) => {
        const lastUpdate = lastUpdateRef.current.get(zonaId) || 0;
        if (now - lastUpdate > cleanupMs) {
          dataBufferRef.current.set(zonaId, []);
        }
      });

      // Limpiar timeouts de agregación
      aggregationTimeoutRef.current.forEach((timeoutId, zonaId) => {
        const lastUpdate = lastUpdateRef.current.get(zonaId) || 0;
        if (now - lastUpdate > cleanupMs) {
          clearTimeout(timeoutId);
          aggregationTimeoutRef.current.delete(zonaId);
        }
      });
    }, finalConfig.cleanupIntervalMs || DEFAULT_IOT_CONFIG.CLEANUP_INTERVAL_MS);

    return () => clearInterval(cleanupInterval);
  }, [finalConfig]);

  // Función para obtener datos optimizados de una zona
  const getOptimizedDataZona = useCallback((zonaId: string): OptimizedSensorData | undefined => {
    return optimizedData.get(zonaId);
  }, [optimizedData]);

  // Función para obtener datos de múltiples zonas
  const getOptimizedDataZonas = useCallback((zonaIds: string[]): OptimizedSensorData[] => {
    return zonaIds
      .map(zonaId => optimizedData.get(zonaId))
      .filter((data): data is OptimizedSensorData => data !== undefined);
  }, [optimizedData]);

  // Función para limpiar datos de una zona específica
  const clearZonaData = useCallback((zonaId: string) => {
    setOptimizedData(prev => {
      const newMap = new Map(prev);
      newMap.delete(zonaId);
      return newMap;
    });
    
    dataBufferRef.current.delete(zonaId);
    lastUpdateRef.current.delete(zonaId);
    renderCountRef.current.delete(zonaId);
    
    const timeoutId = aggregationTimeoutRef.current.get(zonaId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      aggregationTimeoutRef.current.delete(zonaId);
    }
  }, []);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    console.log('IoT Optimization: Reconnectando manualmente...');
    socketReconnect();
  }, [socketReconnect]);

  // Función para obtener estadísticas de rendimiento
  const getPerformanceStats = useCallback(() => {
    const stats = {
      totalZonas: optimizedData.size,
      zonasActivas: Array.from(optimizedData.values()).filter(d => d.sensoresActivos > 0).length,
      totalSensores: Array.from(optimizedData.values()).reduce((sum, d) => sum + d.totalSensores, 0),
      sensoresActivos: Array.from(optimizedData.values()).reduce((sum, d) => sum + d.sensoresActivos, 0),
      bufferSize: Array.from(dataBufferRef.current.values()).reduce((sum, buffer) => sum + buffer.length, 0),
      memoryUsage: {
        optimizedData: optimizedData.size,
        dataBuffer: dataBufferRef.current.size,
        aggregationTimeouts: aggregationTimeoutRef.current.size,
      },
      connection: {
        isConnected,
        isConnecting: socketConnecting,
        error: socketError,
        reconnectAttempts: 0, // TODO: obtener del socket
      }
    };
    
    return stats;
  }, [optimizedData, isConnected, socketConnecting, socketError]);

  // Memoized return value para evitar re-renders innecesarios
  return useMemo(() => ({
    // Estados
    isConnected,
    loading,
    error,
    
    // Datos optimizados
    optimizedData,
    getOptimizedDataZona,
    getOptimizedDataZonas,
    
    // Control
    canUpdateZona,
    canRenderZona,
    clearZonaData,
    clearLecturas,
    
    // Estados MQTT
    estadosMqtt,
    
    // Control de conexión
    reconnect,
    socketConnecting,
    socketError,
    
    // Utilidades
    getPerformanceStats,
    
    // Configuración
    config: finalConfig,
    socketConfig,
  }), [
    isConnected,
    loading,
    error,
    optimizedData,
    getOptimizedDataZona,
    getOptimizedDataZonas,
    canUpdateZona,
    canRenderZona,
    clearZonaData,
    clearLecturas,
    estadosMqtt,
    reconnect,
    socketConnecting,
    socketError,
    getPerformanceStats,
    finalConfig,
    socketConfig,
  ]);
};

/**
 * Hook simplificado para componentes que solo necesitan datos de una zona
 */
export const useIoTDataZona = (zonaId: string, config?: IoTOptimizationConfig) => {
  const iotData = useIoTOptimization(config);
  const zonaData = iotData.getOptimizedDataZona(zonaId);
  
  return {
    ...iotData,
    zonaData,
    zonaId,
  };
};

/**
 * Hook para agregación en tiempo real
 */
export const useIoTAggregation = (zonaIds: string[], config?: IoTOptimizationConfig) => {
  const iotData = useIoTOptimization(config);
  const zonasData = iotData.getOptimizedDataZonas(zonaIds);
  
  // Agregación global de todas las zonas
  const globalAggregation = useMemo(() => {
    const allSensors = zonasData.flatMap(zona => zona.datosAgregados);
    const groupedByKey = new Map<string, AggregatedSensorData[]>();
    
    allSensors.forEach(sensor => {
      if (!groupedByKey.has(sensor.key)) {
        groupedByKey.set(sensor.key, []);
      }
      groupedByKey.get(sensor.key)!.push(sensor);
    });
    
    const aggregated: AggregatedSensorData[] = [];
    groupedByKey.forEach((sensores, key) => {
      const promedios = sensores.map(s => s.promedio);
      const ultimoValores = sensores.map(s => s.ultimoValor);
      
      aggregated.push({
        key,
        promedio: promedios.reduce((sum, val) => sum + val, 0) / promedios.length,
        minimo: Math.min(...sensores.map(s => s.minimo)),
        maximo: Math.max(...sensores.map(s => s.maximo)),
        ultimoValor: ultimoValores[ultimoValores.length - 1],
        unidad: sensores[0].unidad,
        totalMediciones: sensores.reduce((sum, s) => sum + s.totalMediciones, 0),
        timestamp: new Date().toISOString(),
      });
    });
    
    return aggregated;
  }, [zonasData]);
  
  return {
    ...iotData,
    zonasData,
    globalAggregation,
    zonaIds,
  };
};

export default useIoTOptimization;