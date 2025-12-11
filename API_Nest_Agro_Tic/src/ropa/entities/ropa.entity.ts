import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ropa')
export class Ropa {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_ropa' })
  id: string;

  @Column({ name: 'rpa_nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'rpa_descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'rpa_precio', type: 'decimal', precision: 10, scale: 2 })
  precio: number;
}