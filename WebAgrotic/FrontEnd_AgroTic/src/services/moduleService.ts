// src/services/moduleService.ts
import apiClient from "../lib/axios/axios";
import type { Modulo } from '../types/module'; // Will define this type

/**
 * Obtiene todos los módulos disponibles.
 */
export const getModules = async (): Promise<Modulo[]> => {
  try {
    const response = await apiClient.get<Modulo[]>("/modulos");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los módulos:", error);
    throw error;
  }
};