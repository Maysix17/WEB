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
    // Conectar al servidor WebSocket
    socketRef.current = io(apiUrl, {
      transports: ['websocket', 'polling'],
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
        transport: socket.io.engine.transport.name
      });
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
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