import apiClient from '../lib/axios/axios';

export interface Role {
  id: string;
  nombre: string;
  permisos: any[];
}

export interface Modulo {
  id: string;
  nombre: string;
  recursos: Recurso[];
}

export interface Recurso {
  id: string;
  nombre: string;
  permisos: Permiso[];
}

export interface Permiso {
  id: string;
  accion: string;
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/roles');
  return response.data;
};

export const createRole = async (data: { nombre: string }): Promise<{ id: string }> => {
  const response = await apiClient.post('/roles', data);
  return response.data;
};

export const updateRole = async (roleId: string, data: { nombre: string; permisoIds: string[] }): Promise<void> => {
  await apiClient.patch(`/roles/${roleId}`, data);
};

export const assignPermissionsToRole = async (roleId: string, data: { permisoIds: string[] }): Promise<void> => {
  await apiClient.post(`/roles/${roleId}/permisos/multiple`, data);
};

export const deleteRole = async (roleId: string): Promise<void> => {
  await apiClient.delete(`/roles/${roleId}`);
};

export const getModulos = async (): Promise<Modulo[]> => {
  const response = await apiClient.get('/modulos');
  return response.data;
};