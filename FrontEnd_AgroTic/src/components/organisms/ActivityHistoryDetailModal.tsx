import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import { getReservationsByActivity } from '../../services/actividadesService';

interface Reservation {
  id: string;
  cantidadReservada: number;
  cantidadUsada?: number;
  lote?: {
    nombre: string;
    producto: { nombre: string; unidadMedida?: { abreviatura: string } };
  };
  estado?: { nombre: string };
}

interface Activity {
  id: string;
  descripcion: string;
  fechaAsignacion: string;
  horasDedicadas?: number;
  observacion?: string;
  estado: boolean;
  categoriaActividad?: { nombre: string };
  cultivoVariedadZona?: {
    zona: { nombre: string };
    cultivoXVariedad: {
      cultivo: { nombre: string; ficha: { numero: string } };
      variedad: { nombre: string; tipoCultivo: { nombre: string } };
    };
  };
  usuariosAsignados?: { usuario: { dni: number; nombres: string; apellidos: string; ficha?: { numero: number } }; activo: boolean }[];
  inventarioUsado?: { inventario: { nombre: string; id: string; categoria: { nombre: string } }; cantidadUsada: number; activo: boolean }[];
  reservas?: {
    id: string;
    cantidadReservada: number;
    lote: {
      producto: {
        nombre: string;
        unidadMedida: { nombre: string; abreviatura: string };
      };
    };
  }[];
  imgUrl?: string;
}

interface ActivityHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const ActivityHistoryDetailModal: React.FC<ActivityHistoryDetailModalProps> = ({
  isOpen,
  onClose,
  activity,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (activity && isOpen) {
      // Fetch reservations
      const fetchReservations = async () => {
        try {
          const res = await getReservationsByActivity(activity.id);
          setReservations(res);
        } catch (error) {
          console.error('Error fetching reservations:', error);
          setReservations([]);
        }
      };
      fetchReservations();
    }
  }, [activity, isOpen]);

  if (!activity) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-2xl font-semibold">Detalles de Actividad Finalizada</h2>
        </ModalHeader>
        <ModalBody className="max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Usuarios */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Usuarios Responsables</h3>
              <div className="space-y-2 max-h-40 overflow-auto">
                {activity.usuariosAsignados?.filter(u => u.activo).map((uxa, idx) => (
                  <div key={idx} className="p-2 border rounded">
                    <div className="font-medium">{uxa.usuario.nombres} {uxa.usuario.apellidos}</div>
                    <div className="text-sm text-gray-600">DNI: {uxa.usuario.dni}</div>
                    {uxa.usuario.ficha && (
                      <div className="text-sm text-gray-600">Ficha: {uxa.usuario.ficha.numero}</div>
                    )}
                  </div>
                )) || <p className="text-gray-500">No hay aprendices asignados</p>}
              </div>
            </div>

            {/* Reservas */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Reservas de Insumos</h3>
              <div className="space-y-2 max-h-40 overflow-auto">
                {reservations.map((res, idx) => (
                  <div key={idx} className="p-2 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{res.lote?.producto?.nombre}</span>
                      <div className="text-sm">
                        <div>Reservado: {res.cantidadReservada} {res.lote?.producto?.unidadMedida?.abreviatura}</div>
                        <div>Usado: {res.cantidadUsada || 0} {res.lote?.producto?.unidadMedida?.abreviatura}</div>
                        <div>Estado: {res.estado?.nombre}</div>
                      </div>
                    </div>
                  </div>
                )) || <p className="text-gray-500">No hay reservas</p>}
              </div>
            </div>

            {/* Información adicional */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Información Adicional</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium">Fecha de Asignación</label>
                  <div className="text-sm text-gray-600">
                    {new Date(activity.fechaAsignacion).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Estado</label>
                  <div className="text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                      Finalizada
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Horas Dedicadas</label>
                  <div className="text-sm text-gray-600">
                    {activity.horasDedicadas ? `${activity.horasDedicadas} horas` : 'No especificado'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Observación</label>
                  <div className="text-sm text-gray-600">
                    {activity.observacion || 'Sin observaciones'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen de evidencia */}
          {activity.imgUrl && (
            <div className="border rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Imagen de Evidencia</h3>
              <div className="flex justify-center">
                <img
                  src={`http://localhost:3000${activity.imgUrl}`}
                  alt="Evidencia de actividad"
                  className="max-w-full max-h-96 rounded-lg shadow-md"
                  onLoad={() => {
                    console.log(`[${new Date().toISOString()}] ✅ FRONTEND: Image rendered successfully for activity ${activity.id} - Full URL: http://localhost:3000${activity.imgUrl}`);
                  }}
                  onError={(e) => {
                    console.error(`[${new Date().toISOString()}] ❌ FRONTEND: Error rendering image for activity ${activity.id} - Attempted URL: http://localhost:3000${activity.imgUrl} - Original stored URL: ${activity.imgUrl}`);
                    // Try alternative URL construction
                    if (activity.imgUrl) {
                      const alternativeUrl = `http://localhost:3000/uploads/${activity.imgUrl.split('/').pop()}`;
                      console.log(`[${new Date().toISOString()}] 🔄 FRONTEND: Trying alternative URL: ${alternativeUrl}`);
                      e.currentTarget.src = alternativeUrl;
                    }
                  }}
                />
                <div className="hidden text-center text-gray-500 p-4">
                  Error al cargar la imagen
                </div>
              </div>
            </div>
          )}

          {/* Form bottom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria de la actividad</label>
                <div className="p-2 border rounded">{activity.categoriaActividad?.nombre || 'Sin categoría'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación del Cultivo</label>
                <div className="p-2 border rounded">
                  {activity.cultivoVariedadZona?.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'Tipo Cultivo'} -
                  {activity.cultivoVariedadZona?.cultivoXVariedad?.variedad?.nombre || 'Variedad'} -
                  {activity.cultivoVariedadZona?.zona?.nombre || 'Zona'}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <div className="p-2 border rounded min-h-[80px]">{activity.descripcion}</div>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ActivityHistoryDetailModal;