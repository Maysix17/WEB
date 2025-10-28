import type { VariedadData, ApiResponse } from "../types/variedad.types";

const API_URL = "http://localhost:3000/variedades";

// CREATE
export const registerVariedad = async (
  variedadData: VariedadData
): Promise<ApiResponse> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variedadData),
  });

  if (!response.ok) {
    throw new Error("Error al registrar la variedad");
  }

  return response.json();
};

// READ ALL
export const getVariedades = async (): Promise<VariedadData[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener las variedades");
  }

  return response.json();
};

// UPDATE
export const updateVariedad = async (
  id: string,
  variedadData: VariedadData
): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variedadData),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar la variedad");
  }

  return response.json();
};

// DELETE
export const deleteVariedad = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar la variedad");
  }
};

