// Importaciones: cliente Axios configurado y tipos para actividades agrícolas
import apiClient from '@/services/General/axios/axios';
import type { Actividad, CreateActividadData, UsuarioXActividad, Reservation, CreateReservationData, CreateReservationByProductData, ConfirmUsageData } from '@/types/Modulo Actividades/Actividades.types';

// Función para obtener actividades en un rango de fechas
export const getActividadesByDateRange = async (start: string, end: string): Promise<Actividad[]> => {
  const response = await apiClient.get(`/actividades/by-date-range?start=${start}&end=${end}`);
  return response.data;
};

// Función para contar actividades en una fecha específica
export const getActividadesCountByDate = async (date: string): Promise<number> => {
  const response = await apiClient.get(`/actividades/count-by-date/${date}`);
  return response.data;
};

// Función para obtener actividades en una fecha específica
export const getActividadesByDate = async (date: string): Promise<Actividad[]> => {
  const response = await apiClient.get(`/actividades/by-date/${date}`);
  return response.data;
};

// Función para obtener actividades activas en una fecha específica
export const getActividadesByDateWithActive = async (date: string): Promise<Actividad[]> => {
  const response = await apiClient.get(`/actividades/by-date-active/${date}`);
  return response.data;
};

// Función para crear una nueva actividad agrícola
export const createActividad = async (data: CreateActividadData): Promise<Actividad> => {
  const response = await apiClient.post('/actividades', data);
  return response.data;
};

// Función para actualizar una actividad completa (incluyendo usuarios y reservas)
export const updateActividadCompleta = async (
  id: string,
  data: {
    descripcion: string;
    fkCultivoVariedadZonaId: string;
    fkCategoriaActividadId: string;
    usuarios: string[]; // Array of user IDs
    materiales: { id: string; nombre: string; qty: string; isSurplus?: boolean }[]; // Array of materials
  }
): Promise<void> => {
  await apiClient.patch(`/actividades/${id}/completa`, data);
};

// Función para actualizar una actividad (descripción, categoría y lote)
export const updateActividad = async (
  id: string,
  data: {
    descripcion: string;
    fkCategoriaActividadId: string;
    fkCultivoVariedadZonaId?: string;
  }
): Promise<void> => {
  await apiClient.patch(`/actividades/${id}`, data);
};

// Función para eliminar una actividad
export const deleteActividad = async (id: string): Promise<void> => {
  await apiClient.delete(`/actividades/${id}`);
};

// Función para finalizar una actividad con evidencias (imagen, observaciones, horas, etc.)
  export const finalizarActividad = async (id: string, data: { observacion?: string; imgUrl?: any; horas?: number; precioHora?: number; reservas?: { reservaId: string; cantidadDevuelta: number }[] }): Promise<void> => {
    console.log(`[${new Date().toISOString()}] 📤 MOBILE: Finalizing activity ${id} with evidence upload`);
    const formData = new FormData();
    formData.append('actividadId', id);
    if (data.observacion) formData.append('observacion', data.observacion);
    if (data.imgUrl) {
      formData.append('imgUrl', data.imgUrl);
      console.log(`[${new Date().toISOString()}] 📎 MOBILE: Attaching image evidence for activity ${id}`);
    } else {
      console.log(`[${new Date().toISOString()}] 📝 MOBILE: Finalizing activity ${id} without image evidence`);
    }
    if (data.horas !== undefined) formData.append('horas', data.horas.toString());
    if (data.precioHora !== undefined) formData.append('precioHora', data.precioHora.toString());

    // If reservas not provided, assume all used (cantidadDevuelta = 0 for all)
    let reservasToSend = data.reservas;
    if (!data.reservas || data.reservas.length === 0) {
      try {
        console.log(`[${new Date().toISOString()}] 📦 MOBILE: No reservas provided, fetching all reservations for activity ${id}`);
        const allReservas = await getReservationsByActivity(id);
        reservasToSend = allReservas.map(r => ({ reservaId: r.id, cantidadDevuelta: 0 }));
        console.log(`[${new Date().toISOString()}] 📦 MOBILE: Assuming all ${reservasToSend.length} reservations are fully used`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ MOBILE: Error fetching reservations:`, error);
        reservasToSend = [];
      }
    } else {
      reservasToSend = data.reservas.map(r => ({ ...r, cantidadDevuelta: r.cantidadDevuelta || 0 }));
    }

    // Always append reservas field (empty array if no reservations)
    formData.append('reservas', JSON.stringify(reservasToSend || []));
    console.log(`[${new Date().toISOString()}] 📦 MOBILE: Processing ${reservasToSend?.length || 0} returns for activity ${id}`);

    // Usar el endpoint correcto que procesa devoluciones
    try {
      await apiClient.post('/reservas-x-actividad/finalize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(`[${new Date().toISOString()}] ✅ MOBILE: Activity ${id} finalized successfully with returns processed`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ MOBILE: Error finalizing activity ${id}:`, error);
      throw error;
    }
  };

// Función para asignar un usuario a una actividad
export const createUsuarioXActividad = async (data: UsuarioXActividad): Promise<void> => {
  await apiClient.post('/usuarios-x-actividades', data);
};

// Función para crear una reserva de recursos para una actividad
export const createReservation = async (actividadId: string, data: CreateReservationData): Promise<Reservation> => {
  const response = await apiClient.post(`/actividades/${actividadId}/reservas`, data);
  return response.data;
};

// Función para crear una reserva basada en un producto específico
export const createReservationByProduct = async (actividadId: string, data: CreateReservationByProductData): Promise<Reservation> => {
  const response = await apiClient.post(`/actividades/${actividadId}/reservas/producto`, data);
  return response.data;
};

// Función para confirmar el uso de una reserva
export const confirmUsage = async (reservaId: string, data: ConfirmUsageData): Promise<void> => {
  await apiClient.patch(`/actividades/reservas/${reservaId}/confirm-usage`, data);
};

// Función para obtener reservas de una actividad específica
export const getReservationsByActivity = async (actividadId: string): Promise<Reservation[]> => {
  const response = await apiClient.get(`/actividades/${actividadId}/reservas`);
  return response.data;
};

// Función para obtener actividades por ID de cultivo-variedad-zona
export const getActividadesByCultivoVariedadZonaId = async (cvzId: string): Promise<any[]> => {
  const response = await apiClient.get(`/actividades/by-cultivo-variedad-zona/${cvzId}`);
  return response.data;
};

// Función para obtener todas las actividades
export const getAllActividades = async (): Promise<Actividad[]> => {
  const response = await apiClient.get('/actividades');
  return response.data;
};
