import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/productos.entity';
import { Bodega } from '../../bodega/entities/bodega.entity';
import { ReservasXActividad } from '../../reservas_x_actividad/entities/reservas_x_actividad.entity';

@Entity('lotes_inventario')
export class LotesInventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fk_producto_id', type: 'uuid' })
  fkProductoId: string;

  @Column({ name: 'fk_bodega_id', type: 'uuid' })
  fkBodegaId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  cantidadDisponible: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  stock: number;

  @Column({ type: 'boolean', default: false })
  esParcial: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  cantidadParcial: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaIngreso: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento?: Date;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'fk_producto_id' })
  producto?: Producto;

  @ManyToOne(() => Bodega)
  @JoinColumn({ name: 'fk_bodega_id' })
  bodega?: Bodega;

  @OneToMany(() => ReservasXActividad, (r) => r.lote)
  reservas?: ReservasXActividad[];
}
