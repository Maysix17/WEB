import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ReservasXActividad } from '../../reservas_x_actividad/entities/reservas_x_actividad.entity';

@Entity('estados_reserva')
export class EstadoReserva {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

  @OneToMany(() => ReservasXActividad, (r) => r.estado)
  reservas?: ReservasXActividad[];
}
