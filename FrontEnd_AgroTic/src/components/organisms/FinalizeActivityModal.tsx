import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Input, Textarea } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import UpdateEstadoFenologicoModal from './UpdateEstadoFenologicoModal';
import UpdateCantidadPlantasModal from './UpdateCantidadPlantasModal';


interface Activity {
   id: string;
   descripcion: string;
   categoriaActividad?: { nombre: string };
   cultivoVariedadZona?: {
     id?: string;
     zona: { nombre: string };
     cultivoXVariedad: {
       cultivo: { id?: string; nombre: string; ficha: { numero: string }; siembra?: string; cosecha?: string; estado?: number; estado_fenologico?: any };
       variedad: { nombre: string; tipoCultivo: { nombre: string } };
     };
     cantidadPlantasInicial?: number;
     cantidadPlantasActual?: number;
     areaTerreno?: number;
     rendimientoPromedio?: number;
   };
   inventarioUsado?: { inventario: { nombre: string; id: string; categoria: { nombre: string } }; cantidadUsada: number; activo: boolean }[];
   usuariosAsignados?: { usuario: { nombres: string; apellidos: string; id: string }; activo: boolean }[];
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
 }

interface FinalizeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onSave: (data: {
    actividadId: string;
    reservas: { reservaId: string; cantidadDevuelta: number }[];
    horas: number;
    precioHora: number;
    observacion: string;
    imgUrl?: File;
  }) => void;
}

const FinalizeActivityModal: React.FC<FinalizeActivityModalProps> = ({ isOpen, onClose, activity, onSave }) => {
   const [returnedQuantities, setReturnedQuantities] = useState<{ [key: string]: number }>({});
   const [horas, setHoras] = useState('');
   const [precioHora, setPrecioHora] = useState('');
   const [observacion, setObservacion] = useState('');
   const [evidencia, setEvidencia] = useState<File | null>(null);
   const [isUpdateEstadoModalOpen, setIsUpdateEstadoModalOpen] = useState(false);
   const [isUpdateCantidadModalOpen, setIsUpdateCantidadModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && activity) {
      // Reset states
      setReturnedQuantities({});
      setHoras('');
      setPrecioHora('');
      setObservacion('');
      setEvidencia(null);
      setIsUpdateEstadoModalOpen(false);
      setIsUpdateCantidadModalOpen(false);
    }
  }, [isOpen, activity]);

  const handleSave = () => {
    // Validation
    const horasNum = parseFloat(horas);
    const precioNum = parseFloat(precioHora);
    if (!horas || horasNum <= 0) {
      alert('Horas dedicadas es requerido y debe ser un número positivo');
      return;
    }
    if (!precioHora || isNaN(precioNum) || precioNum <= 0) {
      alert('Precio por hora es requerido y debe ser un monto válido');
      return;
    }

    const reservas = activity?.reservas?.map(reserva => ({
      reservaId: reserva.id,
      cantidadDevuelta: returnedQuantities[reserva.id] || 0,
    })) || [];

    const data = {
      actividadId: activity!.id,
      reservas,
      horas: horasNum,
      precioHora: precioNum,
      observacion,
      imgUrl: evidencia || undefined,
    };
    onSave(data);
    onClose();
  };

  if (!activity) return null;


  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl" className="min-h-[510px]">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-2xl font-semibold">Finalizar actividad</h2>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Reservas realizadas */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Reservas realizadas</h3>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {activity?.reservas?.map((reserva) => (
                    <div key={reserva.id} className="p-2 border rounded">
                      <div className="text-sm">
                        <div className="font-medium">{reserva.lote.producto.nombre}</div>
                        <div>Reservado: {reserva.cantidadReservada} {reserva.lote.producto.unidadMedida.abreviatura}</div>
                        <Input
                          type="number"
                          placeholder="Devolver"
                          value={returnedQuantities[reserva.id]?.toString() || ''}
                          onChange={(e) => setReturnedQuantities({ ...returnedQuantities, [reserva.id]: Number(e.target.value) })}
                          min="0"
                          max={reserva.cantidadReservada}
                          size="sm"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No hay reservas</p>}
                </div>
              </div>

              {/* Información de finalización */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Información de finalización</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Horas dedicadas *</label>
                    <Input
                      type="number"
                      placeholder="Ej: 8"
                      value={horas}
                      onChange={(e) => setHoras(e.target.value)}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Precio por hora *</label>
                    <Input
                      type="number"
                      placeholder="Ej: 15000"
                      value={precioHora}
                      onChange={(e) => setPrecioHora(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Observación y Evidencia */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Observación y Evidencia</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Observación</label>
                    <Textarea
                      placeholder="Observaciones adicionales..."
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Evidencia</label>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de actualización para observación */}
            {activity?.categoriaActividad?.nombre === 'observación' && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Actualización de Cultivo</h3>
                <div className="flex gap-2">
                  <CustomButton
                    label="Actualizar Estado Fenológico"
                    onClick={() => setIsUpdateEstadoModalOpen(true)}
                    size="sm"
                    variant="bordered"
                  />
                  <CustomButton
                    label="Actualizar Cantidad de Plantas"
                    onClick={() => setIsUpdateCantidadModalOpen(true)}
                    size="sm"
                    variant="bordered"
                  />
                </div>
              </div>
            )}

            {/* Botón */}
            <div className="flex justify-end gap-2">
              <CustomButton
                type="button"
                onClick={handleSave}
                label="Finalizar Actividad"
                className="txs"
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

    {/* Update Estado Fenológico Modal */}
    <UpdateEstadoFenologicoModal
      isOpen={isUpdateEstadoModalOpen}
      onClose={() => setIsUpdateEstadoModalOpen(false)}
      cultivo={activity?.cultivoVariedadZona ? {
        cvzid: activity.cultivoVariedadZona.id || '',
        id: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.id || '',
        nombrecultivo: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.nombre,
        estado_fenologico: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.estado_fenologico,
        estado_fenologico_nombre: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.estado_fenologico?.nombre,
        ficha: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.ficha?.numero || '',
        lote: activity.cultivoVariedadZona.zona.nombre,
        fechasiembra: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.siembra || '',
        fechacosecha: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.cosecha || '',
        estado: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.estado || 1,
        cantidad_plantas_inicial: activity.cultivoVariedadZona.cantidadPlantasInicial,
        cantidad_plantas_actual: activity.cultivoVariedadZona.cantidadPlantasActual,
        area_terreno: activity.cultivoVariedadZona.areaTerreno,
        rendimiento_promedio: activity.cultivoVariedadZona.rendimientoPromedio
      } as any : null}
      onSuccess={() => {
        setIsUpdateEstadoModalOpen(false);
      }}
    />

    {/* Update Cantidad Plantas Modal */}
    <UpdateCantidadPlantasModal
      isOpen={isUpdateCantidadModalOpen}
      onClose={() => setIsUpdateCantidadModalOpen(false)}
      cultivo={activity?.cultivoVariedadZona ? {
        cvzid: activity.cultivoVariedadZona.id || '',
        id: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.id || '',
        nombrecultivo: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.nombre,
        estado_fenologico: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.estado_fenologico,
        estado_fenologico_nombre: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.estado_fenologico?.nombre,
        ficha: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.ficha?.numero || '',
        lote: activity.cultivoVariedadZona.zona.nombre,
        fechasiembra: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.siembra || '',
        fechacosecha: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.cosecha || '',
        estado: activity.cultivoVariedadZona.cultivoXVariedad.cultivo.estado || 1,
        cantidad_plantas_inicial: activity.cultivoVariedadZona.cantidadPlantasInicial,
        cantidad_plantas_actual: activity.cultivoVariedadZona.cantidadPlantasActual,
        area_terreno: activity.cultivoVariedadZona.areaTerreno,
        rendimiento_promedio: activity.cultivoVariedadZona.rendimientoPromedio
      } as any : null}
      onSuccess={() => {
        setIsUpdateCantidadModalOpen(false);
      }}
    />
    </>
  );
};

export default FinalizeActivityModal;