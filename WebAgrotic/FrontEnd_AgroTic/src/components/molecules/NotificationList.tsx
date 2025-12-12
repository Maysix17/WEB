import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotificationsSocket } from '../../hooks/useNotificationsSocket';
import type { Notification } from '../../types/notification.types';

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  useNotificationsSocket(handleNewNotification);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex items-center gap-3">
        <BellIcon className="w-8 h-8 text-blue-500" />
        <h3 className="text-lg font-semibold">Notificaciones</h3>
      </CardHeader>
      <CardBody>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center">No hay notificaciones nuevas</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded">
                <p className="text-gray-700 font-medium">{notification.activityCategory}</p>
                <p className="text-sm text-gray-600">Zona: {notification.zone}</p>
                <p className="text-sm text-gray-600">Asignado por: {notification.assignedBy}</p>
                <p className="text-sm text-gray-600">Fecha: {new Date(notification.assignmentDate).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

export default NotificationList;