import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePermission } from '../contexts/PermissionContext';

export const usePermissionsSocket = () => {
  const { isAuthenticated, refresh } = usePermission();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Get token from localStorage or wherever it's stored
      const token = localStorage.getItem('token');

      if (token) {
        socketRef.current = io(`${import.meta.env.VITE_API_URL}/permissions`, {
          auth: {
            token,
          },
        });

        socketRef.current.on('connect', () => {
          console.log('Connected to permissions WebSocket');
        });

        socketRef.current.on('permissionChanged', async (payload) => {
          console.log('Permission changed:', payload);
          // If allPermissions are provided in the payload, log them for debugging
          if (payload.allPermissions) {
            console.log('Received cached permissions from WebSocket:', payload.allPermissions.length, 'permission groups');
          }
          try {
            await refresh(); // Refresh permissions
            console.log('Permissions refreshed successfully after WebSocket event');
          } catch (error) {
            console.error('Failed to refresh permissions after WebSocket event:', error);
            // Optionally, emit an error event or handle UI notification here
          }
        });

        socketRef.current.on('disconnect', () => {
          console.log('Disconnected from permissions WebSocket');
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
        });
      }
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, refresh]);
};