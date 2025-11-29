import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import type { Cultivo } from '../../types/cultivos.types';
import { calcularEdadCultivo } from '../../services/cultivosVariedadZonaService';
import * as XLSX from 'xlsx';
import { getActividadesByCultivoVariedadZonaId } from '../../services/actividadesService';
import { getCosechasByCultivo } from '../../services/cosechasService';
import { getVentas } from '../../services/ventaService';
import type { Actividad } from '../../services/actividadesService';
import apiClient from '../../lib/axios/axios';

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

  const exportToExcel = async () => {
    if (!currentCultivo) return;

    try {
      // Fetch all related data
      const [actividades, cosechas, ventas] = await Promise.all([
        getActividadesByCultivoVariedadZonaId(currentCultivo.cvzid),
        getCosechasByCultivo(currentCultivo.cvzid),
        getVentas()
      ]);

      // Filter ventas related to this cultivo's cosechas
      const cultivoVentas = ventas.filter(venta =>
        cosechas.some(cosecha => cosecha.id === venta.fkCosechaId)
      );

      // Fetch financial data for the cultivo
      let finanzas = null;
      try {
        const cosechasResponse = await apiClient.get(`/cosechas/cultivo/${currentCultivo.cvzid}`);
        const cosechasCultivo = cosechasResponse.data;
        if (cosechasCultivo && cosechasCultivo.length > 0) {
          const response = await apiClient.get(`/finanzas/cultivo/${currentCultivo.cvzid}/dinamico`);
          finanzas = response.data;
        } else {
          const response = await apiClient.get(`/finanzas/cultivo/${currentCultivo.cvzid}/actividades`);
          finanzas = response.data;
        }
      } catch (finanzasError) {
        console.warn('Could not fetch financial data:', finanzasError);
      }

      // Calculate total production cost from activities
      const calculateCostoManoObra = (activity: Actividad) => {
        return (activity.horasDedicadas || 0) * ((activity as any).precioHora || 0);
      };

      const calculateCostoInventario = (activity: Actividad) => {
        if (!(activity as any).reservas || (activity as any).reservas.length === 0) return 0;
        let total = 0;
        for (const reserva of (activity as any).reservas) {
          const cantidadUsada = reserva.cantidadUsada || 0;
          if (cantidadUsada > 0) {
            const esDivisible = reserva.lote?.producto?.categoria?.esDivisible ?? true;
            if (esDivisible) {
              const precioUnitario = (reserva.precioProducto || 0) / (reserva.capacidadPresentacionProducto || 1);
              total += cantidadUsada * precioUnitario;
            } else {
              const vidaUtil = reserva.lote?.producto?.categoria?.vidaUtilPromedioPorUsos;
              if (vidaUtil && vidaUtil > 0) {
                const valorResidual = (reserva.precioProducto || 0) * 0.1;
                const costoPorUso = ((reserva.precioProducto || 0) - valorResidual) / vidaUtil;
                total += costoPorUso;
              } else {
                const precioUnitario = (reserva.precioProducto || 0) / (reserva.capacidadPresentacionProducto || 1);
                total += cantidadUsada * precioUnitario;
              }
            }
          }
        }
        return total;
      };

      const costoTotalProduccion = actividades
        .filter(act => act.estado === false) // Only finalized activities
        .reduce((sum, act) => sum + calculateCostoManoObra(act) + calculateCostoInventario(act), 0);

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Resumen del Cultivo (with added total production cost)
      const resumenData = [
        ["Campo", "Valor"],
        ["ID del Cultivo", currentCultivo.cvzid],
        ["Ficha", currentCultivo.ficha],
        ["Lote", currentCultivo.lote],
        ["Nombre del Cultivo", `${currentCultivo.tipoCultivo?.nombre || ''} ${currentCultivo.nombrecultivo}`.trim()],
        ["Fecha de Siembra", currentCultivo.fechasiembra ? new Date(currentCultivo.fechasiembra).toLocaleDateString('es-CO') : "N/A"],
        ["Fecha de Cosecha", currentCultivo.fechacosecha ? new Date(currentCultivo.fechacosecha).toLocaleDateString('es-CO') : "N/A"],
        ["Edad del Cultivo", currentCultivo.fechasiembra ? `${calcularEdadCultivo(currentCultivo.fechasiembra)} días` : "N/A"],
        ["Cantidad de Plantas Inicial", currentCultivo.cantidad_plantas_inicial || "No registrado"],
        ["Cantidad de Plantas Actual", currentCultivo.cantidad_plantas_actual || "No registrado"],
        ["Estado Fenológico", currentCultivo.estado_fenologico_nombre || (typeof currentCultivo.estado_fenologico === 'object' ? currentCultivo.estado_fenologico.nombre : (currentCultivo.estado_fenologico || "No definido"))],
        ["Área del Terreno", currentCultivo.area_terreno ? `${currentCultivo.area_terreno} m²` : "N/A"],
        ["Rendimiento Promedio", currentCultivo.rendimiento_promedio ? `${currentCultivo.rendimiento_promedio.toFixed(2)} kg/planta` : "Sin datos"],
        ["Estado", currentCultivo.estado === 1 ? "En Curso" : "Finalizado"],
        ["Total Actividades", actividades.length],
        ["Total Cosechas", cosechas.length],
        ["Total Ventas", cultivoVentas.length],
        ["Ingresos Totales", cultivoVentas.reduce((sum, venta) => sum + (venta.precioUnitario || 0) * venta.cantidad, 0).toFixed(2)],
        ["Costo Total de Producción", costoTotalProduccion.toFixed(2)],
        ["Fecha de Exportación", new Date().toLocaleDateString('es-CO')]
      ];
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      wsResumen['!cols'] = [
        { wch: 30 }, // Campo
        { wch: 25 }  // Valor
      ];
      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen del Cultivo");

      // Filter finalized activities for the activity sheets
      const finalizedActivities = actividades.filter(act => act.estado === false);

      // Sheet 2: Historial de Actividades
      const actividadesData = [
        ["ID", "Fecha Asignación", "Categoría", "Usuario Responsable", "Inventario Utilizado", "Zona", "Estado", "Observación", "Horas Dedicadas", "Costo de Mano de Obra", "Costo Total de la Actividad"]
      ];

      finalizedActivities.forEach((activity: Actividad) => {
        const costoManoObra = calculateCostoManoObra(activity);
        const costoTotal = costoManoObra + calculateCostoInventario(activity);
        actividadesData.push([
          activity.id,
          activity.fechaAsignacion ? new Date(activity.fechaAsignacion + 'T00:00:00').toLocaleDateString('es-CO') : "N/A",
          (activity as any).categoriaActividad?.nombre || 'Sin categoría',
          (activity as any).nombreResponsable || 'Sin responsable',
          (activity as any).reservas && (activity as any).reservas.length > 0
            ? (activity as any).reservas.map((r: any) => `${r.lote?.producto?.nombre} (${r.cantidadUsada || 0} ${r.lote?.producto?.unidadMedida?.abreviatura})`).join(', ')
            : 'Sin inventario',
          (currentCultivo as any).zona?.nombre || 'Sin zona',
          'Finalizada',
          activity.observacion || '',
          (activity.horasDedicadas || 0).toString(),
          costoManoObra.toFixed(2),
          costoTotal.toFixed(2)
        ]);
      });

      const wsActividades = XLSX.utils.aoa_to_sheet(actividadesData);
      wsActividades['!cols'] = [
        { wch: 15 }, // ID
        { wch: 15 }, // Fecha Asignación
        { wch: 20 }, // Categoría
        { wch: 25 }, // Usuario Responsable
        { wch: 40 }, // Inventario Utilizado
        { wch: 15 }, // Zona
        { wch: 12 }, // Estado
        { wch: 50 }, // Observación
        { wch: 15 }, // Horas Dedicadas
        { wch: 20 }, // Costo de Mano de Obra
        { wch: 20 }  // Costo Total de la Actividad
      ];
      XLSX.utils.book_append_sheet(wb, wsActividades, "Historial de Actividades");

      // Sheet 3: Detalle de Inventario
      const inventarioData = [
        ["ID Actividad", "Fecha Asignación", "Categoría", "Usuario Responsable", "Producto", "Cantidad Reservada", "Cantidad Usada", "Unidad de Medida", "Precio Unitario", "Subtotal", "Zona", "Estado"]
      ];

      finalizedActivities.forEach((activity: Actividad) => {
        if ((activity as any).reservas && (activity as any).reservas.length > 0) {
          (activity as any).reservas.forEach((reserva: any) => {
            const precioUnitario = (reserva.precioProducto || 0) / (reserva.capacidadPresentacionProducto || 1);
            const cantidadUsada = reserva.cantidadUsada || 0;
            const esDivisible = reserva.lote?.producto?.categoria?.esDivisible ?? true;
            let subtotal = 0;
            if (esDivisible) {
              subtotal = cantidadUsada * precioUnitario;
            } else {
              const vidaUtil = reserva.lote?.producto?.categoria?.vidaUtilPromedioPorUsos;
              if (vidaUtil && vidaUtil > 0) {
                const valorResidual = (reserva.precioProducto || 0) * 0.1;
                subtotal = ((reserva.precioProducto || 0) - valorResidual) / vidaUtil;
              } else {
                subtotal = cantidadUsada * precioUnitario;
              }
            }
            inventarioData.push([
              activity.id,
              activity.fechaAsignacion ? new Date(activity.fechaAsignacion + 'T00:00:00').toLocaleDateString('es-CO') : "N/A",
              (activity as any).categoriaActividad?.nombre || 'Sin categoría',
              (activity as any).nombreResponsable || 'Sin responsable',
              reserva.lote?.producto?.nombre || 'Producto desconocido',
              reserva.cantidadReservada || 0,
              cantidadUsada,
              reserva.lote?.producto?.unidadMedida?.abreviatura || 'N/A',
              precioUnitario.toFixed(2),
              subtotal.toFixed(2),
              (currentCultivo as any).zona?.nombre || 'Sin zona',
              'Finalizada'
            ]);
          });
        } else {
          inventarioData.push([
            activity.id,
            activity.fechaAsignacion ? new Date(activity.fechaAsignacion + 'T00:00:00').toLocaleDateString('es-CO') : "N/A",
            (activity as any).categoriaActividad?.nombre || 'Sin categoría',
            (activity as any).nombreResponsable || 'Sin responsable',
            'Sin inventario utilizado',
            0,
            0,
            'N/A',
            '0.00',
            '0.00',
            (currentCultivo as any).zona?.nombre || 'Sin zona',
            'Finalizada'
          ]);
        }
      });

      const wsInventario = XLSX.utils.aoa_to_sheet(inventarioData);
      wsInventario['!cols'] = [
        { wch: 15 }, // ID Actividad
        { wch: 15 }, // Fecha Asignación
        { wch: 20 }, // Categoría
        { wch: 25 }, // Usuario Responsable
        { wch: 30 }, // Producto
        { wch: 18 }, // Cantidad Reservada
        { wch: 15 }, // Cantidad Usada
        { wch: 18 }, // Unidad de Medida
        { wch: 15 }, // Precio Unitario
        { wch: 12 }, // Subtotal
        { wch: 15 }, // Zona
        { wch: 12 }  // Estado
      ];
      XLSX.utils.book_append_sheet(wb, wsInventario, "Detalle de Inventario");

      // Sheet 4: Análisis de Costos
      const costosData = [
        ["ID Actividad", "Fecha Asignación", "Categoría", "Usuario Responsable", "Costo de Mano de Obra", "Costo Total Insumos", "Costo Total Actividad", "Zona", "Estado"]
      ];

      finalizedActivities.forEach((activity: Actividad) => {
        const costoManoObra = calculateCostoManoObra(activity);
        const costoInventario = calculateCostoInventario(activity);
        const costoTotal = costoManoObra + costoInventario;
        costosData.push([
          activity.id,
          activity.fechaAsignacion ? new Date(activity.fechaAsignacion + 'T00:00:00').toLocaleDateString('es-CO') : "N/A",
          (activity as any).categoriaActividad?.nombre || 'Sin categoría',
          (activity as any).nombreResponsable || 'Sin responsable',
          costoManoObra.toFixed(2),
          costoInventario.toFixed(2),
          costoTotal.toFixed(2),
          (currentCultivo as any).zona?.nombre || 'Sin zona',
          'Finalizada'
        ]);
      });

      const wsCostos = XLSX.utils.aoa_to_sheet(costosData);
      wsCostos['!cols'] = [
        { wch: 15 }, // ID Actividad
        { wch: 15 }, // Fecha Asignación
        { wch: 20 }, // Categoría
        { wch: 25 }, // Usuario Responsable
        { wch: 20 }, // Costo de Mano de Obra
        { wch: 20 }, // Costo Total Insumos
        { wch: 20 }, // Costo Total Actividad
        { wch: 15 }, // Zona
        { wch: 12 }  // Estado
      ];
      XLSX.utils.book_append_sheet(wb, wsCostos, "Análisis de Costos");

      // Financial sheets (only if financial data is available)
      if (finanzas) {
        // Sheet 5: Resumen Financiero
        const resumenFinancieroData = [
          ["Concepto", "Valor"],
          ["Cantidad Cosechada", finanzas.cantidadCosechada.toString() + " KG"],
          ["Precio por Kilo", `$${finanzas.precioPorKilo.toFixed(2)}`],
          ["Fecha de Venta", finanzas.fechaVenta ? new Date(finanzas.fechaVenta).toLocaleDateString('es-CO') : "N/A"],
          ["Cantidad Vendida", finanzas.cantidadVendida.toString() + " KG"],
          ["Costo Inventario", `$${finanzas.costoInventario.toFixed(2)}`],
          ["Costo Mano de Obra", `$${finanzas.costoManoObra.toFixed(2)}`],
          ["Costo Total de Producción", `$${finanzas.costoTotalProduccion.toFixed(2)}`],
          ["Ingresos Totales", `$${finanzas.ingresosTotales.toFixed(2)}`],
          ["Ganancias", `$${finanzas.ganancias.toFixed(2)}`],
          ["Margen de Ganancia", `${(finanzas.margenGanancia * 100).toFixed(2)}%`],
          ["Fecha de Cálculo", new Date(finanzas.fechaCalculo).toLocaleDateString('es-CO')],
          ["Fecha de Exportación", new Date().toLocaleDateString('es-CO')]
        ];
        const wsResumenFinanciero = XLSX.utils.aoa_to_sheet(resumenFinancieroData);
        wsResumenFinanciero['!cols'] = [
          { wch: 30 }, // Concepto
          { wch: 25 }  // Valor
        ];
        XLSX.utils.book_append_sheet(wb, wsResumenFinanciero, "Resumen Financiero");

        // Sheet 6: Detalle de Costos
        const detalleCostosData = [
          ["Categoría", "Descripción", "Monto"],
          ["Producción", "Costo total de producción", finanzas.costoTotalProduccion.toString()],
          ["Inventario", "Costo de insumos y materiales", finanzas.costoInventario.toString()],
          ["Mano de Obra", "Costo de mano de obra", finanzas.costoManoObra.toString()],
          ["Total Costos", "Suma de todos los costos", finanzas.costoTotalProduccion.toString()]
        ];
        const wsDetalleCostos = XLSX.utils.aoa_to_sheet(detalleCostosData);
        wsDetalleCostos['!cols'] = [
          { wch: 15 }, // Categoría
          { wch: 35 }, // Descripción
          { wch: 20 }  // Monto
        ];
        XLSX.utils.book_append_sheet(wb, wsDetalleCostos, "Detalle de Costos");

        // Sheet 7: Ingresos y Rentabilidad
        const ingresosRentabilidadData = [
          ["Concepto", "Cantidad", "Precio Unitario", "Total"],
          ["Producción Total", finanzas.cantidadCosechada.toString() + " KG", `$${finanzas.precioPorKilo.toFixed(2)}`, `$${finanzas.cantidadCosechada * finanzas.precioPorKilo}`],
          ["Ventas Realizadas", finanzas.cantidadVendida.toString() + " KG", `$${finanzas.precioPorKilo.toFixed(2)}`, `$${finanzas.ingresosTotales.toFixed(2)}`],
          ["Eficiencia de Ventas", `${((finanzas.cantidadVendida / finanzas.cantidadCosechada) * 100).toFixed(2)}%`, "", ""],
          ["Resultado Final", "", "", `$${finanzas.ganancias.toFixed(2)}`]
        ];
        const wsIngresosRentabilidad = XLSX.utils.aoa_to_sheet(ingresosRentabilidadData);
        wsIngresosRentabilidad['!cols'] = [
          { wch: 25 }, // Concepto
          { wch: 20 }, // Cantidad
          { wch: 20 }, // Precio Unitario
          { wch: 20 }  // Total
        ];
        XLSX.utils.book_append_sheet(wb, wsIngresosRentabilidad, "Ingresos y Rentabilidad");
      }

      // Generate and download file
      const fileName = `Informe_Completo_Cultivo_${currentCultivo.ficha}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error al exportar el informe. Por favor, inténtelo de nuevo.');
    }
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
            Exportar Excel
          </CustomButton>
        </ModalFooter>
      </ModalContent>

    </Modal>
  );
};

export default CultivoDetailsModal;