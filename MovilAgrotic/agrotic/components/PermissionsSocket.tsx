import React from 'react';
import { usePermissionsSocket } from '../hooks/usePermissionsSocket';

const PermissionsSocket: React.FC = () => {
  usePermissionsSocket();
  return null; // This component doesn't render anything, just manages the socket
};

export default PermissionsSocket;