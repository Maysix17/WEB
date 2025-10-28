import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanzasCosecha } from './entities/finanzas_cosecha.entity';
import { Cosecha } from '../cosechas/entities/cosecha.entity';
import { ReservasXActividad } from '../reservas_x_actividad/entities/reservas_x_actividad.entity';
import { Actividad } from '../actividades/entities/actividades.entity';
import { Venta } from '../venta/entities/venta.entity';
import { CultivosVariedadXZona } from '../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';

@Injectable()
export class FinanzasService {
  constructor(
    @InjectRepository(FinanzasCosecha)
    private readonly finanzasRepo: Repository<FinanzasCosecha>,
    @InjectRepository(Cosecha)
    private readonly cosechaRepo: Repository<Cosecha>,
    @InjectRepository(ReservasXActividad)
    private readonly reservasRepo: Repository<ReservasXActividad>,
    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,
    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(CultivosVariedadXZona)
    private readonly cultivosVariedadXZonaRepo: Repository<CultivosVariedadXZona>,
  ) {}

  async calcularFinanzasCosecha(cosechaId: string): Promise<FinanzasCosecha> {
    // Obtener la cosecha con relaciones
    const cosecha = await this.cosechaRepo.findOne({
      where: { id: cosechaId },
      relations: ['cultivosVariedadXZona', 'ventas'],
    });

    if (!cosecha) {
      throw new NotFoundException(`Cosecha con ID ${cosechaId} no encontrada`);
    }

    // Calcular costos de inventario desde reservas
    const costoInventario = await this.calcularCostoInventario(cosechaId);

    // Calcular costos de mano de obra desde actividades
    const costoManoObra = await this.calcularCostoManoObra(cosechaId);

    // Calcular ingresos desde ventas
    const ingresosTotales = await this.calcularIngresosTotales(cosechaId);

    // Datos básicos
    const cantidadCosechada = parseFloat(cosecha.cantidad.toString());
    const cantidadVendida = cosecha.ventas?.reduce((total, venta) =>
      total + parseFloat(venta.cantidad.toString()), 0) || 0;

    const costoTotalProduccion = costoInventario + costoManoObra;
    const ganancias = ingresosTotales - costoTotalProduccion;
    const margenGanancia = costoTotalProduccion > 0 ? (ganancias / ingresosTotales) * 100 : 0;

    // Obtener precio promedio por kilo
    const precioPorKilo = await this.calcularPrecioPromedioKilo(cosechaId);

    // Crear o actualizar registro de finanzas
    const finanzas = this.finanzasRepo.create({
      fkCosechaId: cosechaId,
      cantidadCosechada,
      precioPorKilo,
      cantidadVendida,
      costoInventario,
      costoManoObra,
      costoTotalProduccion,
      ingresosTotales,
      ganancias,
      margenGanancia,
      fechaCalculo: new Date(),
    });

    return await this.finanzasRepo.save(finanzas);
  }

  async calcularFinanzasCultivoDinamico(cultivoId: string): Promise<FinanzasCosecha> {
    // Obtener todas las cosechas del cultivo
    const cosechas = await this.cosechaRepo.find({
      where: { fkCultivosVariedadXZonaId: cultivoId },
      relations: ['cultivosVariedadXZona', 'ventas'],
    });

    if (cosechas.length === 0) {
      throw new NotFoundException(`No se encontraron cosechas para el cultivo ${cultivoId}`);
    }

    // Calcular totales acumulados
    let totalCosechado = 0;
    let totalVendido = 0;
    let totalCostoInventario = 0;
    let totalCostoManoObra = 0;
    let totalIngresos = 0;
    let precioPromedioKilo = 0;

    for (const cosecha of cosechas) {
      // Costos de inventario por cosecha
      const costoInventarioCosecha = await this.calcularCostoInventario(cosecha.id);
      totalCostoInventario += costoInventarioCosecha;

      // Costos de mano de obra por cosecha
      const costoManoObraCosecha = await this.calcularCostoManoObra(cosecha.id);
      totalCostoManoObra += costoManoObraCosecha;

      // Ingresos por cosecha
      const ingresosCosecha = await this.calcularIngresosTotales(cosecha.id);
      totalIngresos += ingresosCosecha;

      // Cantidades
      totalCosechado += parseFloat(cosecha.cantidad.toString());
      totalVendido += cosecha.ventas?.reduce((total, venta) =>
        total + parseFloat(venta.cantidad.toString()), 0) || 0;
    }

    // Calcular precio promedio ponderado
    if (totalVendido > 0) {
      precioPromedioKilo = totalIngresos / totalVendido;
    }

    const costoTotalProduccion = totalCostoInventario + totalCostoManoObra;
    const ganancias = totalIngresos - costoTotalProduccion;
    const margenGanancia = costoTotalProduccion > 0 ? (ganancias / totalIngresos) * 100 : 0;

    // Crear registro dinámico (no persistente, solo para visualización)
    const finanzas = this.finanzasRepo.create({
      fkCosechaId: cultivoId, // Usamos el ID del cultivo como referencia
      cantidadCosechada: totalCosechado,
      precioPorKilo: precioPromedioKilo,
      cantidadVendida: totalVendido,
      costoInventario: totalCostoInventario,
      costoManoObra: totalCostoManoObra,
      costoTotalProduccion,
      ingresosTotales: totalIngresos,
      ganancias,
      margenGanancia,
      fechaCalculo: new Date(),
    });

    return finanzas;
  }

  private async calcularCostoInventario(cosechaId: string): Promise<number> {
    // Obtener todas las actividades relacionadas con la cosecha
    const actividades = await this.actividadRepo.find({
      where: { fkCultivoVariedadZonaId: (await this.cosechaRepo.findOne({
        where: { id: cosechaId },
        relations: ['cultivosVariedadXZona']
      }))?.cultivosVariedadXZona?.id },
      relations: ['reservas', 'reservas.lote', 'reservas.lote.producto', 'reservas.lote.producto.categoria'],
    });

    let costoTotal = 0;

    for (const actividad of actividades) {
      if (actividad.reservas) {
        for (const reserva of actividad.reservas) {
          // Verificar si el producto es divisible (consumible) o no divisible (herramienta)
          const esDivisible = reserva.lote?.producto?.categoria?.esDivisible ?? true; // Default true para compatibilidad

          if (esDivisible) {
            // Lógica actual para productos divisibles (consumibles)
            const costoReserva = (reserva.cantidadUsada || 0) *
              (reserva.precioProducto / reserva.capacidadPresentacionProducto);
            costoTotal += costoReserva;
          } else {
            // Nueva lógica para productos no divisibles (herramientas) - consumo por uso
            const vidaUtilPromedioPorUsos = reserva.lote?.producto?.vidaUtilPromedioPorUsos;

            if (vidaUtilPromedioPorUsos && vidaUtilPromedioPorUsos > 0) {
              // Valor residual = 10% del precio del producto
              const valorResidual = reserva.precioProducto * 0.1;
              const costoPorUso = (reserva.precioProducto - valorResidual) / vidaUtilPromedioPorUsos;

              // Cada reserva cuenta como 1 uso
              costoTotal += costoPorUso;
            } else {
              // Fallback: si no hay vida útil definida, usar lógica normal
              const costoReserva = (reserva.cantidadUsada || 0) *
                (reserva.precioProducto / reserva.capacidadPresentacionProducto);
              costoTotal += costoReserva;
            }
          }
        }
      }
    }

    return costoTotal;
  }

  private async calcularCostoManoObra(cosechaId: string): Promise<number> {
    // Obtener todas las actividades relacionadas con la cosecha
    const actividades = await this.actividadRepo.find({
      where: { fkCultivoVariedadZonaId: (await this.cosechaRepo.findOne({
        where: { id: cosechaId },
        relations: ['cultivosVariedadXZona']
      }))?.cultivosVariedadXZona?.id },
    });

    let costoTotal = 0;

    for (const actividad of actividades) {
      // Costo = horas dedicadas * precio por hora
      const costoActividad = (actividad.horasDedicadas || 0) * (actividad.precioHora || 0);
      costoTotal += costoActividad;
    }

    return costoTotal;
  }

  private async calcularIngresosTotales(cosechaId: string): Promise<number> {
    // Obtener todas las ventas de la cosecha
    const ventas = await this.ventaRepo.find({
      where: { fkCosechaId: cosechaId },
    });

    let ingresosTotales = 0;

    for (const venta of ventas) {
      // Ingresos = cantidad vendida * precio por kilo
      const ingresosVenta = parseFloat(venta.cantidad.toString()) * venta.precioKilo;
      ingresosTotales += ingresosVenta;
    }

    return ingresosTotales;
  }

  private async calcularPrecioPromedioKilo(cosechaId: string): Promise<number> {
    const ventas = await this.ventaRepo.find({
      where: { fkCosechaId: cosechaId },
    });

    if (ventas.length === 0) return 0;

    const precioTotal = ventas.reduce((total, venta) => total + venta.precioKilo, 0);
    return precioTotal / ventas.length;
  }

  async obtenerFinanzasCosecha(cosechaId: string): Promise<FinanzasCosecha | null> {
    return await this.finanzasRepo.findOne({
      where: { fkCosechaId: cosechaId },
      relations: ['cosecha'],
    });
  }

  async obtenerFinanzasCultivo(cultivoId: string): Promise<FinanzasCosecha[]> {
    // Obtener todas las cosechas del cultivo
    const cosechas = await this.cosechaRepo.find({
      where: { fkCultivosVariedadXZonaId: cultivoId },
    });

    const finanzas: FinanzasCosecha[] = [];

    for (const cosecha of cosechas) {
      const finanza = await this.obtenerFinanzasCosecha(cosecha.id);
      if (finanza) {
        finanzas.push(finanza);
      }
    }

    return finanzas;
  }
}