import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import type { LecturaNueva, EstadoMqtt } from '../types/Modulo Sensores/Mediciones.types';

interface MqttSocketConfig {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  maxLecturas?: number;
}

const DEFAULT_CONFIG: Required<MqttSocketConfig> = {
  maxReconnectAttempts: 5,
  reconnectDelay: 3000,
  heartbeatInterval: 30000,
  maxLecturas: 100,
};

export const useMqttSocket = (config: MqttSocketConfig = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lecturas, setLecturas] = useState<LecturaNueva[]>([]);
  const [estadosMqtt, setEstadosMqtt] = useState<EstadoMqtt[]>([]);

  // Función para limpiar heartbeat
  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Función para iniciar heartbeat
  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('ping', { timestamp: Date.now() });
      }
    }, finalConfig.heartbeatInterval);
  }, [clearHeartbeat, finalConfig.heartbeatInterval]);

  // Función para reconectar
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= finalConfig.maxReconnectAttempts) {
      setConnectionError(`Máximo número de intentos de reconexión alcanzado (${finalConfig.maxReconnectAttempts})`);
      return;
    }

    setIsConnecting(true);
    reconnectAttemptsRef.current += 1;
    
    setTimeout(() => {
      if (socketRef.current) {
        console.log(`Intento de reconexión ${reconnectAttemptsRef.current}/${finalConfig.maxReconnectAttempts}`);
        socketRef.current.connect();
      }
    }, finalConfig.reconnectDelay);
  }, [finalConfig.maxReconnectAttempts, finalConfig.reconnectDelay]);

  // Función para conectar sin autenticación compleja
  const connect = useCallback(async () => {
    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (!apiUrl) {
      setConnectionError('API URL no configurada en app.json');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    // Limpiar socket anterior si existe
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log('Conectando al WebSocket MQTT en:', apiUrl);

    // Crear nueva conexión simple
    socketRef.current = io(apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: false, // Manejamos la reconexión manualmente
      reconnectionAttempts: 0,
    });

    const socket = socketRef.current;

    // Event listeners
    socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket MQTT');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      startHeartbeat();
    });

    socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor WebSocket MQTT:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      clearHeartbeat();
      
      // Reconectar automáticamente si no fue una desconexión manual
      if (reason !== 'io client disconnect') {
        attemptReconnect();
      }
    });

    socket.on('lecturaNueva', (data: LecturaNueva) => {
      console.log('Nueva lectura MQTT recibida:', data);
      setLecturas(prev => {
        const newLecturas = [data, ...prev];
        return newLecturas.slice(0, finalConfig.maxLecturas);
      });
    });

    socket.on('estadoConexion', (estado: EstadoMqtt) => {
      console.log('Estado MQTT actualizado:', estado);
      setEstadosMqtt(prev => {
        const filtered = prev.filter(e => e.zonaId !== estado.zonaId);
        return [...filtered, estado];
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket MQTT:', error);
      setConnectionError(`Error de conexión: ${error.message || 'Error desconocido'}`);
      setIsConnected(false);
      setIsConnecting(false);
      attemptReconnect();
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket MQTT reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      startHeartbeat();
    });

    socket.on('reconnect_error', (error) => {
      console.error('Error de reconexión WebSocket:', error);
      attemptReconnect();
    });

    socket.on('reconnect_failed', () => {
      console.error('Falló la reconexión WebSocket después de todos los intentos');
      setConnectionError('Falló la reconexión después de todos los intentos');
      setIsConnecting(false);
    });

    socket.on('pong', (data) => {
      console.log('Heartbeat response received:', data);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(`Error de socket: ${error.message || 'Error desconocido'}`);
    });

    return socket;
  }, [startHeartbeat, clearHeartbeat, attemptReconnect, finalConfig.maxLecturas]);

  // Efecto principal de conexión
  useEffect(() => {
    connect();
  }, [connect]);

  // Efecto de limpieza
  useEffect(() => {
    return () => {
      console.log('Desconectando WebSocket MQTT');
      clearHeartbeat();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [clearHeartbeat]);

  // Función para reconectar manualmente
  const reconnect = useCallback(async () => {
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    await connect();
  }, [connect]);

  // Función para verificar estado de autenticación simplificada
  const isAuthenticated = useCallback(async (): Promise<boolean> => {
    return isConnected;
  }, [isConnected]);

  const getEstadoZona = useCallback((zonaId: string): EstadoMqtt | undefined => {
    return estadosMqtt.find(e => e.zonaId === zonaId);
  }, [estadosMqtt]);

  const getLecturasZona = useCallback((zonaId: string): LecturaNueva[] => {
    return lecturas.filter(l => l.zonaId === zonaId);
  }, [lecturas]);

  const getUltimaLecturaZona = useCallback((zonaId: string): LecturaNueva | undefined => {
    return lecturas.find(l => l.zonaId === zonaId);
  }, [lecturas]);

  const clearLecturas = useCallback(() => {
    setLecturas([]);
  }, []);

  const clearEstadosMqtt = useCallback(() => {
    setEstadosMqtt([]);
  }, []);

  return {
    // Estados de conexión
    isConnected,
    isConnecting,
    connectionError,
    
    // Datos
    lecturas,
    estadosMqtt,
    
    // Funciones de utilidad
    getEstadoZona,
    getLecturasZona,
    getUltimaLecturaZona,
    clearLecturas,
    clearEstadosMqtt,
    
    // Control de conexión
    reconnect,
    connect,
    
    // Autenticación simplificada
    isAuthenticated,
    
    // Configuración
    config: finalConfig,
  };
};