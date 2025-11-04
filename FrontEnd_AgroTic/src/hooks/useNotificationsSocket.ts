import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Notification } from '../types/notification.types';

export const useNotificationsSocket = (onNotification?: (notification: Notification) => void) => {
  const handleNotification = useCallback((notification: Notification) => {
    if (onNotification) {
      onNotification(notification);
    }
  }, [onNotification]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const socket: Socket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('Connected to notifications WebSocket');
      });

      socket.on('newNotification', handleNotification);

      socket.on('disconnect', () => {
        console.log('Disconnected from notifications WebSocket');
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [handleNotification]);
};