import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { forwardRef } from '@nestjs/common';
import { Actividad } from '../../actividades/entities/actividades.entity';
import { LotesInventario } from '../../lotes_inventario/entities/lotes_inventario.entity';
import { EstadoReserva } from '../../estados_reserva/entities/estados_reserva.entity';

@Entity('reservas_x_actividad')
export class ReservasXActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fk_actividad_id', type: 'uuid' })
  fkActividadId: string;

  @Column({ name: 'fk_lote_id', type: 'uuid' })
  fkLoteId: string;

  @Column({ name: 'fk_estado_id', type: 'int' })
  fkEstadoId: number;

  @Column({
    name: 'cantidad_reservada',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  cantidadReservada: number;

  @Column({
    name: 'cantidad_usada',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cantidadUsada?: number;

  @Column({
    name: 'cantidad_devuelta',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cantidadDevuelta?: number;

  @Column({
    name: 'capacidad_presentacion_producto',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  capacidadPresentacionProducto: number;

  @Column({
    name: 'precio_producto',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  precioProducto: number;

  @ManyToOne(() => Actividad, (a) => a.reservas)
  @JoinColumn({ name: 'fk_actividad_id' })
  actividad?: Actividad;

  @ManyToOne(() => LotesInventario, (l) => l.reservas)
  @JoinColumn({ name: 'fk_lote_id' })
  lote?: LotesInventario;

  @ManyToOne(() => EstadoReserva, (e) => e.reservas)
  @JoinColumn({ name: 'fk_estado_id' })
  estado?: EstadoReserva;
}
