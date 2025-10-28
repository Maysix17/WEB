import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cosecha } from '../../cosechas/entities/cosecha.entity';

@Entity('finanzas_cosecha')
export class FinanzasCosecha {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fk_cosecha_id' })
  fkCosechaId: string;

  // Datos de la cosecha
  @Column({ name: 'cantidad_cosechada', type: 'numeric', precision: 10, scale: 2 })
  cantidadCosechada: number;

  @Column({ name: 'precio_por_kilo', type: 'numeric', precision: 10, scale: 2 })
  precioPorKilo: number;

  @Column({ name: 'fecha_venta', type: 'date', nullable: true })
  fechaVenta?: string;

  @Column({ name: 'cantidad_vendida', type: 'numeric', precision: 10, scale: 2, default: 0 })
  cantidadVendida: number;

  // Costos de producción
  @Column({ name: 'costo_inventario', type: 'numeric', precision: 12, scale: 2, default: 0 })
  costoInventario: number;

  @Column({ name: 'costo_mano_obra', type: 'numeric', precision: 12, scale: 2, default: 0 })
  costoManoObra: number;

  @Column({ name: 'costo_total_produccion', type: 'numeric', precision: 12, scale: 2, default: 0 })
  costoTotalProduccion: number;

  // Resultados financieros
  @Column({ name: 'ingresos_totales', type: 'numeric', precision: 12, scale: 2, default: 0 })
  ingresosTotales: number;

  @Column({ name: 'ganancias', type: 'numeric', precision: 12, scale: 2, default: 0 })
  ganancias: number;

  @Column({ name: 'margen_ganancia', type: 'numeric', precision: 5, scale: 2, default: 0 })
  margenGanancia: number; // Porcentaje

  @Column({ name: 'fecha_calculo', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCalculo: Date;

  @ManyToOne(() => Cosecha)
  @JoinColumn({ name: 'fk_cosecha_id' })
  cosecha?: Cosecha;
}