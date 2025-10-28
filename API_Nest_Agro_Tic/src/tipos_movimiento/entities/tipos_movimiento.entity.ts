import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipos_movimiento')
export class TipoMovimiento {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;
}
