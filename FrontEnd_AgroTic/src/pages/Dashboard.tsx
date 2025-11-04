import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button } from '@heroui/react';
import {
  UserIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  BeakerIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from '../lib/axios/axios';
import { useNotificationsSocket } from '../hooks/useNotificationsSocket';
import type { Notification } from '../types/notification.types';

// Mock data for prototype
const mockUser = {
  name: 'Juan Pérez',
  role: 'Administrador',
};

const mockLastHarvest = {
  date: '2025-10-30',
  quantity: '500 kg',
  details: 'Tomates orgánicos',
};

const mockLastSale = {
  date: '2025-10-29',
  total: '$2,500',
  products: ['Tomates', 'Lechugas', 'Zanahorias'],
};

const mockLastInventoryMovement = {
  user: 'María García',
  date: '2025-10-28',
  type: 'Entrada',
  products: ['Fertilizante X: 100 unidades', 'Semillas Y: 50 paquetes'],
};

interface AssignedActivity {
  id: string;
  actividad: {
    descripcion: string;
    categoriaActividad: {
      nombre: string;
    };
    cultivoVariedadZona: {
      zona: {
        nombre: string;
      };
    };
    responsable: {
      nombres: string;
      apellidos: string;
      rol: {
        nombre: string;
      };
    };
  };
  fechaAsignacion: string;
  usuario: {
    nombres: string;
    apellidos: string;
  };
}

const environmentalMetrics = [
  { name: 'Humedad', value: '65%', unit: '%' },
  { name: 'pH del Suelo', value: '6.8', unit: '' },
  { name: 'Temperatura', value: '24°C', unit: '' },
  { name: 'Humedad del Suelo', value: '78%', unit: '%' },
];


const pieData = [
  { name: 'Ventas', value: 60, color: '#8884d8' },
  { name: 'Cosechas', value: 30, color: '#82ca9d' },
  { name: 'Otros', value: 10, color: '#ffc658' },
];

const Dashboard: React.FC = () => {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [assignedActivities, setAssignedActivities] = useState<AssignedActivity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isActivitiesHovered, setIsActivitiesHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextMetric = () => {
    setCurrentMetricIndex((prevIndex) =>
      (prevIndex + 1) % environmentalMetrics.length
    );
  };

  const fetchAssignedActivities = async () => {
    try {
      const response = await axios.get('/usuarios-x-actividades');
      setAssignedActivities(response.data);
      setCurrentActivityIndex(0); // Reset to first page when data changes
    } catch (error) {
      console.error('Error fetching assigned activities:', error);
    }
  };

  const itemsPerPage = 2;
  const totalPages = Math.ceil(assignedActivities.length / itemsPerPage);
  const startIndex = currentActivityIndex * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = assignedActivities.slice(startIndex, endIndex);

  const nextActivityPage = () => {
    if (currentActivityIndex < totalPages - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentActivityIndex(currentActivityIndex + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevActivityPage = () => {
    if (currentActivityIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentActivityIndex(currentActivityIndex - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  // Handler for new notifications
  const handleNewNotification = () => {
    fetchAssignedActivities();
  };

  // Use the notifications socket hook
  useNotificationsSocket(handleNewNotification);

  useEffect(() => {
    fetchAssignedActivities();
  }, []);
  return (
    <div className="bg-gray-50 w-full flex flex-col h-full">

      {/* Grid Layout for Cards - Optimized for no scroll */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - 2 cards */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Pending Activities Card */}
          <Card
            className="shadow-lg hover:shadow-xl transition-shadow flex-1 relative"
            onMouseEnter={() => setIsActivitiesHovered(true)}
            onMouseLeave={() => setIsActivitiesHovered(false)}
          >
            <CardHeader className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-orange-500" />
              <h3 className="text-lg font-semibold">Actividades Programadas</h3>
            </CardHeader>
            <CardBody className={`transition-transform duration-300 ease-in-out ${isAnimating ? 'transform -translate-y-2' : ''}`}>
              <ul className="space-y-2">
                {assignedActivities.length === 0 ? (
                  <li className="border-l-4 border-orange-500 pl-3 py-2">
                    <p className="text-gray-700">No tienes actividades asignadas</p>
                  </li>
                ) : (
                  currentActivities.map((activity) => (
                    <li key={activity.id} className="border-l-4 border-orange-500 pl-3 py-2">
                      <p className="text-gray-700 font-medium">
                        {activity.actividad?.categoriaActividad?.nombre || 'Sin categoría'}: {activity.actividad?.descripcion || 'Sin descripción'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Zona: {activity.actividad?.cultivoVariedadZona?.zona?.nombre || 'Sin zona'} | Asignado por: {activity.actividad?.responsable?.nombres || 'N/A'} {activity.actividad?.responsable?.apellidos || ''} / {activity.actividad?.responsable?.rol?.nombre || 'Sin rol'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Fecha de asignación: {new Date(activity.fechaAsignacion).toLocaleDateString()}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </CardBody>

            {/* Navigation Buttons - Only visible on hover */}
            {isActivitiesHovered && assignedActivities.length > itemsPerPage && (
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                <button
                  onClick={prevActivityPage}
                  disabled={currentActivityIndex === 0 || isAnimating}
                  className={`p-2 rounded-full text-white shadow-lg transition-all duration-200 ${
                    currentActivityIndex === 0 || isAnimating
                      ? 'opacity-50 cursor-not-allowed bg-[#15A55A]'
                      : 'hover:scale-110 bg-[#15A55A] hover:bg-[#128a4a]'
                  }`}
                  aria-label="Previous activities page"
                >
                  <ChevronUpIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={nextActivityPage}
                  disabled={currentActivityIndex >= totalPages - 1 || isAnimating}
                  className={`p-2 rounded-full text-white shadow-lg transition-all duration-200 ${
                    currentActivityIndex >= totalPages - 1 || isAnimating
                      ? 'opacity-50 cursor-not-allowed bg-[#15A55A]'
                      : 'hover:scale-110 bg-[#15A55A] hover:bg-[#128a4a]'
                  }`}
                  aria-label="Next activities page"
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </Card>

          {/* Last Inventory Movement Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow flex-1">
            <CardHeader className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-purple-500" />
              <h3 className="text-lg font-semibold">Último Movimiento en Inventario</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700"><strong>Usuario:</strong> {mockLastInventoryMovement.user}</p>
              <p className="text-gray-700"><strong>Fecha:</strong> {mockLastInventoryMovement.date}</p>
              <p className="text-gray-700"><strong>Tipo:</strong> {mockLastInventoryMovement.type}</p>
              <p className="text-gray-700"><strong>Productos:</strong></p>
              <ul className="list-disc list-inside text-gray-700">
                {mockLastInventoryMovement.products.map((product, index) => (
                  <li key={index}>{product}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - 3 cards */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Welcome and Environmental Data Cards - Side by side with equal height */}
          <div className="flex gap-4 flex-1">
            {/* Environmental Data Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow flex-1 flex flex-col">
              <CardHeader className="flex items-center gap-3">
                <BeakerIcon className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold">
                  Datos del Ambiente<br />
                  Zona Actual
                </h3>
              </CardHeader>
              <CardBody className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-bold text-green-600">
                  {environmentalMetrics[currentMetricIndex].name}: {environmentalMetrics[currentMetricIndex].value}
                </p>
                <Button
                  color="primary"
                  size="sm"
                  onClick={nextMetric}
                >
                  Siguiente
                </Button>
              </CardBody>
            </Card>

            {/* Welcome Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow flex-1 flex flex-col">
              <CardHeader className="flex items-center gap-3">
                <UserIcon className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold">¡Bienvenido, {mockUser.name}!</h3>
                  <p className="text-sm text-gray-600">Rol: {mockUser.role}</p>
                </div>
              </CardHeader>
              <CardBody className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-gray-700">
                  ¡Hola! Aquí tienes un resumen de tu actividad reciente.
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Last Sale Card - Centered and slightly taller */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow flex-1 flex flex-col">
            <CardHeader className="flex items-center gap-3">
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-500" />
              <h3 className="text-lg font-semibold">Última Venta</h3>
            </CardHeader>
            <CardBody className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="flex flex-col justify-center">
                  <p className="text-gray-700"><strong>Fecha:</strong> {mockLastSale.date}</p>
                  <p className="text-gray-700"><strong>Monto Total:</strong> {mockLastSale.total}</p>
                  <p className="text-gray-700"><strong>Productos:</strong> {mockLastSale.products.join(', ')}</p>
                </div>
                <div className="flex justify-center items-center">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" outerRadius={50}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Harvest Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow flex-1 flex flex-col">
            <CardHeader className="flex items-center gap-3">
              <TruckIcon className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold">Última Cosecha</h3>
            </CardHeader>
            <CardBody className="flex-1 flex flex-col justify-center">
              <p className="text-gray-700"><strong>Fecha:</strong> {mockLastHarvest.date}</p>
              <p className="text-gray-700"><strong>Cantidad:</strong> {mockLastHarvest.quantity}</p>
              <p className="text-gray-700"><strong>Detalles:</strong> {mockLastHarvest.details}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;