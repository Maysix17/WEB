import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import type { Cultivo } from '../../types/cultivos.types';
import { calcularEdadCultivo } from '../../services/cultivosVariedadZonaService';

interface CultivoDetailsModalProps {
   isOpen: boolean;
   onClose: () => void;
   cultivo: Cultivo | null;
 }

const CultivoDetailsModal: React.FC<CultivoDetailsModalProps> = ({
   isOpen,
   onClose,
   cultivo
 }) => {
  console.log('CultivoDetailsModal - isOpen:', isOpen, 'cultivo:', cultivo);

  const [currentCultivo, setCurrentCultivo] = useState<Cultivo | null>(cultivo);

  // Update local state when cultivo prop changes
  useEffect(() => {
    console.log('CultivoDetailsModal - cultivo prop changed:', cultivo);
    setCurrentCultivo(cultivo);
  }, [cultivo]);


  if (!currentCultivo) return null;

  const exportToExcel = () => {
    if (!currentCultivo) return;

    const headers = ["Campo", "Valor"];
    const data = [
      ["Ficha", currentCultivo.ficha],
      ["Lote", currentCultivo.lote],
      ["Nombre del Cultivo", `${currentCultivo.tipoCultivo?.nombre} ${currentCultivo.nombrecultivo}`],
      ["Fecha de Siembra", currentCultivo.fechasiembra],
      ["Fecha de Cosecha", currentCultivo.fechacosecha],
      ["Edad del Cultivo", currentCultivo.fechasiembra ? `${calcularEdadCultivo(currentCultivo.fechasiembra)} días` : "N/A"],
      ["Cantidad de Plantas Inicial", currentCultivo.cantidad_plantas_inicial || "No registrado"],
      ["Cantidad de Plantas Actual", currentCultivo.cantidad_plantas_actual || "No registrado"],
      ["Estado Fenológico", typeof currentCultivo.estado_fenologico === 'object' ? currentCultivo.estado_fenologico.nombre : (currentCultivo.estado_fenologico || "No definido")],
      ["Área del Terreno", currentCultivo.area_terreno ? `${currentCultivo.area_terreno} m²` : "N/A"],
      ["Rendimiento Promedio", currentCultivo.rendimiento_promedio ? `${currentCultivo.rendimiento_promedio.toFixed(2)} kg/planta` : "Sin datos"],
      ["Estado", currentCultivo.estado === 1 ? "En Curso" : "Finalizado"]
    ];

    // Crear contenido HTML para Excel
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Detalles del Cultivo - ${currentCultivo.nombrecultivo}</title></head>
      <body>
        <table border="1">
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
          <tbody>
            ${data.map(([campo, valor]) => `<tr><td>${campo}</td><td>${valor}</td></tr>`).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileName = `cultivo_${currentCultivo.ficha}_${new Date().toISOString().split("T")[0]}.xls`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent className="bg-white">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Detalles del Cultivo</h2>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Información Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ficha</label>
              <p className="text-sm text-gray-900">{currentCultivo.ficha}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lote</label>
              <p className="text-sm text-gray-900">{currentCultivo.lote}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre del Cultivo</label>
              <p className="text-sm text-gray-900">{currentCultivo.tipoCultivo?.nombre} {currentCultivo.nombrecultivo}</p>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Siembra</label>
              <p className="text-sm text-gray-900">
                {currentCultivo.fechasiembra ? new Date(currentCultivo.fechasiembra).toLocaleDateString() : "Sin fecha"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Cosecha</label>
              <p className="text-sm text-gray-900">
                {currentCultivo.fechacosecha ? new Date(currentCultivo.fechacosecha).toLocaleDateString() : "Sin cosecha"}
              </p>
            </div>
          </div>

          {/* Características del Cultivo */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">Características del Cultivo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Edad del Cultivo</label>
                <p className="text-sm text-gray-900">
                  {currentCultivo.fechasiembra ? `${calcularEdadCultivo(currentCultivo.fechasiembra)} días` : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad de Plantas Inicial</label>
                <p className="text-sm text-gray-900">{currentCultivo.cantidad_plantas_inicial || "No registrado"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad de Plantas Actual</label>
                <p className="text-sm text-gray-900">{currentCultivo.cantidad_plantas_actual || "No registrado"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado Fenológico</label>
                <p className="text-sm text-gray-900">
                  {currentCultivo.estado_fenologico_nombre || (typeof currentCultivo.estado_fenologico === 'object' ? currentCultivo.estado_fenologico.nombre : (currentCultivo.estado_fenologico || "No definido"))}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Área del Terreno</label>
                <p className="text-sm text-gray-900">
                  {currentCultivo.area_terreno ? `${currentCultivo.area_terreno} m²` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado del Cultivo</label>
            <span className={`px-2 py-1 rounded-full text-xs ${
              currentCultivo.estado === 1 ? 'bg-primary-100 text-primary-800' : 'bg-red-100 text-red-800'
            }`}>
              {currentCultivo.estado === 1 ? 'En Curso' : 'Finalizado'}
            </span>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <CustomButton onClick={onClose} variant="bordered">
            Cerrar
          </CustomButton>

          {/* BOTÓN DE INFORMACIÓN EN ESQUINA DERECHA */}
          <CustomButton onClick={exportToExcel} variant="solid" color="success">
            Información
          </CustomButton>
        </ModalFooter>
      </ModalContent>

    </Modal>
  );
};

export default CultivoDetailsModal;