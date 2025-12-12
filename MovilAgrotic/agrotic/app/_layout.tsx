import { Stack } from "expo-router";
import { PermissionProvider } from '../contexts/PermissionContext';
import PermissionsSocket from '../components/PermissionsSocket';
import PermissionErrorBoundary from '../components/PermissionErrorBoundary';
import { linking, handleDeepLink } from '../utils/deepLinking';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

function DeepLinkHandler() {
  useEffect(() => {
    // Handle deep links when app is opened
    const handleInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('Initial URL:', initialUrl);
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    // Handle deep links when app is already running
    const handleUrlEvent = (event: { url: string }) => {
      console.log('URL event:', event.url);
      handleDeepLink(event.url);
    };

    // Set up listeners
    handleInitialUrl();
    const subscription = Linking.addEventListener('url', handleUrlEvent);

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <PermissionProvider>
      <PermissionsSocket />
      <PermissionErrorBoundary>
        <DeepLinkHandler />
        <Stack screenOptions={{ headerShown: false }} />
      </PermissionErrorBoundary>
    </PermissionProvider>
  );
}
