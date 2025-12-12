import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useSmartEffect, useProtectedState } from '@/hooks/usePerformanceOptimization';

/**
 * Ejemplo completo de implementación de estrategias de optimización
 * Demuestra cómo usar los hooks de performance para evitar bucles infinitos
 * y controlar la frecuencia de actualizaciones
 */
const OptimizedAuthExample: React.FC = () => {
  // Hook principal de autenticación optimizado
  const {
    isAuthenticated,
    user,
    loading,
    error,
    logout,
    refreshToken,
    canUpdate,
    canRefresh,
    debug,
    timeUntilNextUpdate
  } = useOptimizedAuth({
    autoInitialize: true,           // Auto-inicializar al montar
    refreshInterval: 300000,        // Auto-refresh cada 5 minutos
    maxAuthChecks: 5,               // Máximo 5 verificaciones por minuto
    enableAutoRefresh: true,        // Habilitar refresh automático
    navigationEnabled: false        // Deshabilitar navegación automática para este ejemplo
  });

  // Estado protegido para evitar actualizaciones excesivas
  const {
    state: localState,
    setState: setLocalState,
    updateCount: localUpdateCount
  } = useProtectedState<{
    counter: number;
    lastAction: string;
    data: string | null;
  }>({
    counter: 0,
    lastAction: '',
    data: null
  }, {
    maxUpdates: 10,                 // Máximo 10 actualizaciones por minuto
    timeWindow: 60000,
    onExcessiveUpdates: (count) => {
      Alert.alert(
        'Advertencia de Rendimiento',
        `Demasiadas actualizaciones detectadas (${count}/10). Considera optimizar tu código.`
      );
    }
  });

  // Estado para controlar cuándo se actualiza un valor
  const [externalData, setExternalData] = useState<string>('valor inicial');
  
  // Debounce del valor externo
  const debouncedExternalData = useDebouncedValue(externalData, 1000);

  // useSmartEffect para actualizaciones controladas
  useSmartEffect(
    () => {
      console.log('OptimizedAuth: Processing debounced data:', debouncedExternalData);
      
      setLocalState(prev => ({
        ...prev,
        counter: prev.counter + 1,
        lastAction: `Processed: ${debouncedExternalData}`,
        data: debouncedExternalData
      }));
    },
    [debouncedExternalData],  // Solo se ejecuta cuando este valor cambie realmente
    {
      enabled: isAuthenticated,  // Solo cuando esté autenticado
      debounceMs: 500,           // Debounce de 500ms
      throttleMs: 2000           // Throttle de 2 segundos
    }
  );

  // Simulación de actualización de datos con throttling
  const handleDataUpdate = (newValue: string) => {
    console.log('OptimizedAuth: Updating external data:', newValue);
    setExternalData(newValue);
  };

  // Función de logout optimizada
  const handleOptimizedLogout = async () => {
    try {
      await logout();
      // Reset local state
      setLocalState({
        counter: 0,
        lastAction: '',
        data: null
      });
      setExternalData('valor inicial');
      
      Alert.alert('Éxito', 'Logout completado con limpieza optimizada');
    } catch (error: any) {
      Alert.alert('Error', 'Error en logout: ' + error.message);
    }
  };

  // Función de refresh manual con control de frecuencia
  const handleManualRefresh = async () => {
    if (!canRefresh) {
      Alert.alert(
        'Throttling Activo', 
        `Espera ${Math.ceil(timeUntilNextUpdate / 1000)} segundos antes del próximo refresh`
      );
      return;
    }

    try {
      const success = await refreshToken();
      if (success) {
        Alert.alert('Éxito', 'Token refrescado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo refrescar el token');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Error en refresh: ' + error.message);
    }
  };

  // Simulación de múltiples actualizaciones rápidas (para demostrar throttling)
  const handleRapidUpdates = () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    values.forEach((value, index) => {
      setTimeout(() => {
        handleDataUpdate(`Actualización ${value} #${index + 1}`);
      }, index * 100); // Actualizaciones cada 100ms
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Inicializando autenticación optimizada...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#007AFF' }}>
        🔧 Ejemplo de Autenticación Optimizada
      </Text>

      {/* Estado de Autenticación */}
      <View style={{ 
        backgroundColor: isAuthenticated ? '#D4EDDA' : '#F8D7DA', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20 
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: isAuthenticated ? '#155724' : '#721C24'
        }}>
          🔐 Estado: {isAuthenticated ? 'Autenticado' : 'No Autenticado'}
        </Text>
        
        {user && (
          <View style={{ marginTop: 10 }}>
            <Text>👤 Usuario: {user.nombres} {user.apellidos}</Text>
            <Text>📧 Email: {user.email}</Text>
            <Text>🆔 DNI: {user.dni}</Text>
          </View>
        )}
      </View>

      {/* Información de Debug */}
      <View style={{ 
        backgroundColor: '#E7F3FF', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20 
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          📊 Información de Debug
        </Text>
        <Text>✅ Inicializado: {debug.isInitialized ? 'Sí' : 'No'}</Text>
        <Text>❌ Tiene Error: {debug.hasError ? 'Sí' : 'No'}</Text>
        <Text>🔢 Contador de Updates: {debug.updateCount}</Text>
        <Text>⏱️ Última Actualización: {new Date(debug.lastUpdate).toLocaleTimeString()}</Text>
        <Text>🚀 Estado de Actualización: {loading ? 'Cargando...' : 'Listo'}</Text>
        <Text>🔄 Estado de Refresh: {loading ? 'En progreso...' : 'Disponible'}</Text>
        {timeUntilNextUpdate > 0 && (
          <Text>⏳ Tiempo hasta próximo update: {Math.ceil(timeUntilNextUpdate / 1000)}s</Text>
        )}
      </View>

      {/* Estado Local Protegido */}
      <View style={{ 
        backgroundColor: '#FFF3CD', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20 
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          🛡️ Estado Local Protegido
        </Text>
        <Text>🔢 Contador: {localState.counter}</Text>
        <Text>📝 Última Acción: {localState.lastAction || 'Ninguna'}</Text>
        <Text>💾 Datos: {localState.data || 'N/A'}</Text>
        <Text>📈 Updates Locales: {localUpdateCount}/10 (por minuto)</Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={{ 
          backgroundColor: '#F8D7DA', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 20 
        }}>
          <Text style={{ color: '#721C24', fontWeight: 'bold' }}>
            ❌ Error: {error}
          </Text>
        </View>
      )}

      {/* Botones de Control */}
      <View style={{ gap: 10 }}>
        {isAuthenticated ? (
          <>
            <Button 
              title="🔄 Refresh Manual de Token" 
              onPress={handleManualRefresh}
              color="#007AFF"
            />
            
            <Button 
              title="📊 Simular Actualizaciones Rápidas" 
              onPress={handleRapidUpdates}
              color="#FF9500"
            />
            
            <Button 
              title="🗑️ Logout Optimizado" 
              onPress={handleOptimizedLogout}
              color="#FF3B30"
            />
          </>
        ) : (
          <Button 
            title="🔑 Simular Login" 
            onPress={() => Alert.alert('Info', 'Simula el login en tu componente real')}
            color="#34C759"
          />
        )}
        
        <Button 
          title="🔍 Ver Estadísticas de Axios" 
          onPress={() => {
            // Import dinámico para evitar problemas de circular dependency
            import('@/services/General/axios/axios').then(({ getAxiosStats }) => {
              const stats = getAxiosStats();
              Alert.alert(
                'Estadísticas de Axios', 
                `Is Refreshing: ${stats.isRefreshing}\n` +
                `Failed Queue: ${stats.failedQueueLength}\n` +
                `Request Queue: ${stats.requestQueueLength}\n` +
                `Processing Queue: ${stats.isProcessingQueue}\n` +
                `Time Since Last Request: ${stats.timeSinceLastRequest}ms`
              );
            });
          }}
          color="#8E8E93"
        />
      </View>

      {/* Información de Estrategias Implementadas */}
      <View style={{ 
        backgroundColor: '#F0F0F0', 
        padding: 15, 
        borderRadius: 8, 
        marginTop: 30 
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          ⚙️ Estrategias Implementadas
        </Text>
        <Text style={{ marginBottom: 5 }}>
          ✅ <Text style={{ fontWeight: 'bold' }}>useSmartEffect:</Text> Control inteligente de dependencias
        </Text>
        <Text style={{ marginBottom: 5 }}>
          ✅ <Text style={{ fontWeight: 'bold' }}>useProtectedState:</Text> Límites de frecuencia de updates
        </Text>
        <Text style={{ marginBottom: 5 }}>
          ✅ <Text style={{ fontWeight: 'bold' }}>Throttling:</Text> Control de frecuencia de requests
        </Text>
        <Text style={{ marginBottom: 5 }}>
          ✅ <Text style={{ fontWeight: 'bold' }}>Debouncing:</Text> Retraso en actualizaciones de datos
        </Text>
        <Text style={{ marginBottom: 5 }}>
          ✅ <Text style={{ fontWeight: 'bold' }}>Race Condition Prevention:</Text> Flags y promises compartidos
        </Text>
        <Text>
          ✅ <Text style={{ fontWeight: 'bold' }}>Auto-refresh:</Text> Refresh automático con throttling
        </Text>
      </View>
    </ScrollView>
  );
};

// Hook auxiliar para debounce que faltaba en el ejemplo
const useDebouncedValue = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default OptimizedAuthExample;

/**
 * HOOK PERSONALIZADO ADICIONAL para casos específicos
 */
export const useThrottledAuthCheck = (interval: number = 60000) => {
  const { isAuthenticated, checkAuth, canUpdate } = useOptimizedAuth();
  const [lastCheck, setLastCheck] = useState(0);

  const throttledCheck = useCallback(async () => {
    const now = Date.now();
    
    if (now - lastCheck < interval || !canUpdate) {
      console.log('AuthCheck: Throttled - too frequent or cannot update');
      return isAuthenticated;
    }

    setLastCheck(now);
    return await checkAuth();
  }, [isAuthenticated, checkAuth, canUpdate, lastCheck, interval]);

  return { throttledCheck, lastCheck };
};