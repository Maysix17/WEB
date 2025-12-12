import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { usePermission } from '../contexts/PermissionContext';

export const usePermissionsSocket = () => {
  const { isAuthenticated, refresh } = usePermission();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Get token from AsyncStorage
      const getTokenAndConnect = async () => {
        try {
          const token = await AsyncStorage.getItem('access_token');

          if (token) {
            const apiUrl = Constants.expoConfig?.extra?.apiUrl;
            socketRef.current = io(`${apiUrl}/permissions`, {
              auth: {
                token,
              },
              timeout: 5000, // 5 seconds timeout
              reconnection: true,
              reconnectionAttempts: 3,
              reconnectionDelay: 1000,
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
        } catch (error) {
          console.error('Error getting token for WebSocket:', error);
        }
      };

      getTokenAndConnect();
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