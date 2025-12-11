import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { RopaData } from "../types/ropa.types";
import {
  registerRopa,
  getRopas,
  updateRopa,
  deleteRopa,
} from "../services/ropa";
import Swal from 'sweetalert2';

const RopaPage = () => {
  const [ropaData, setRopaData] = useState<RopaData>({
    nombre: "",
    descripcion: "",
    precio: 0,
  });
  const [ropas, setRopas] = useState<RopaData[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  // Cargar lista al iniciar
  useEffect(() => {
    fetchRopas();
  }, []);

  const fetchRopas = async () => {
    try {
      const data = await getRopas();
      setRopas(data);
    } catch (err) {
      console.error("Error al cargar ropas", err);
    }
  };

  // Crear o actualizar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateRopa(editId, ropaData);
        setMessage("Actualizado con éxito");
      } else {
        await registerRopa(ropaData);
        setMessage("Registro exitoso");
      }

      setRopaData({ nombre: "", descripcion: "", precio: 0 });
      setEditId(null);
      fetchRopas();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error en la operación");
    }
  };

  const handleEdit = (id: string, nombre: string, descripcion: string = "", precio: number = 0) => {
    setEditId(id);
    setRopaData({ nombre, descripcion, precio });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Seguro que deseas eliminar esta ropa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteRopa(id);
        fetchRopas();
        await Swal.fire({
          title: 'Eliminado',
          text: 'Ropa eliminada exitosamente.',
          icon: 'success',
          timer: 5000,
          showConfirmButton: false
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message ||
                             error.message ||
                             'Error al eliminar la ropa.';
        await Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          timer: 5000,
          showConfirmButton: true
        });
      }
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-10 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editId ? "Editar Ropa" : "Registrar Ropa"}
          </h2>
          <button
            type="button"
            className="text-gray-500 hover:text-red-500 text-lg"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={ropaData.nombre}
              onChange={(e) =>
                setRopaData({ ...ropaData, nombre: e.target.value })
              }
              placeholder="Ingrese el nombre de la ropa"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={ropaData.descripcion}
              onChange={(e) =>
                setRopaData({ ...ropaData, descripcion: e.target.value })
              }
              placeholder="Ingrese la descripción"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio
            </label>
            <input
              type="number"
              step="0.01"
              value={ropaData.precio}
              onChange={(e) =>
                setRopaData({ ...ropaData, precio: parseFloat(e.target.value) || 0 })
              }
              placeholder="Ingrese el precio"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {message && (
            <p className="text-center text-primary-600 text-sm">{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-medium"
          >
            {editId ? "Actualizar" : "Registrar"}
          </button>
        </form>

        {/* Tabla */}
        <table className="w-full border text-sm text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ropas.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-2 border">{r.nombre}</td>
                <td className="p-2 border">{r.descripcion || ""}</td>
                <td className="p-2 border">${Number(r.precio).toFixed(2)}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(r.id!, r.nombre, r.descripcion || "", r.precio)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(r.id!)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {ropas.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-2">
                  No hay registros aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RopaPage;