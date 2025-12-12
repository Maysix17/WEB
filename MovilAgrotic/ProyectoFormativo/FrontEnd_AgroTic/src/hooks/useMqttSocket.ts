import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { type MedicionSensor, type EstadoMqtt } from '../services/zonasService';

interface LecturaNueva {
  zonaId: string;
  mediciones: MedicionSensor[];
  timestamp: string;
}

export const useMqttSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lecturas, setLecturas] = useState<LecturaNueva[]>([]);
  const [estadosMqtt, setEstadosMqtt] = useState<EstadoMqtt[]>([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('Attempting to connect to WebSocket at:', apiUrl);
    
    try {
      // Conectar al servidor WebSocket
      socketRef.current = io(apiUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000, // 5 second timeout
        forceNew: true, // Force new connection
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Conectado al servidor WebSocket');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Desconectado del servidor WebSocket');
        setIsConnected(false);
      });

      socket.on('lecturaNueva', (data: LecturaNueva) => {
        console.log('Nueva lectura MQTT:', data);
        setLecturas(prev => [data, ...prev.slice(0, 49)]); // Mantener últimas 50 lecturas
      });

      socket.on('estadoConexion', (estado: EstadoMqtt) => {
        console.log('Estado MQTT actualizado:', estado);
        setEstadosMqtt(prev => {
          const filtered = prev.filter(e => e.zonaId !== estado.zonaId);
          return [...filtered, estado];
        });
      });

      socket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error);
        console.error('Connection details:', {
          url: apiUrl,
          error: error.message,
          transport: socket?.io?.engine?.transport?.name || 'unknown'
        });
        setIsConnected(false);
        
        // If it's a connection timeout, provide helpful error message
        if (error.message?.includes('timeout')) {
          console.log('WebSocket connection timeout. Make sure the backend server is running on port 3000');
        }
      });

      // Handle connection timeout
      setTimeout(() => {
        if (socket && !socket.connected) {
          console.warn('WebSocket connection timeout after 5 seconds. This is normal if the backend is not fully started.');
        }
      }, 6000);

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket connection:', error);
      setIsConnected(false);
    }
  }, []);

  const getEstadoZona = (zonaId: string): EstadoMqtt | undefined => {
    return estadosMqtt.find(e => e.zonaId === zonaId);
  };

  const getLecturasZona = (zonaId: string): LecturaNueva[] => {
    return lecturas.filter(l => l.zonaId === zonaId);
  };

  const clearLecturas = () => {
    setLecturas([]);
  };

  return {
    isConnected,
    lecturas,
    estadosMqtt,
    getEstadoZona,
    getLecturasZona,
    clearLecturas,
  };
};