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
    const socket: Socket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      withCredentials: true,
    });

    socket.on('newNotification', handleNotification);

    return () => {
      socket.disconnect();
    };
  }, [handleNotification]);
};