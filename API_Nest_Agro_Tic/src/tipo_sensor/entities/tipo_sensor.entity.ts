// File: src/entities/tipo_sensor/tipo_sensor.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sensor } from '../../sensor/entities/sensor.entity';

@Entity('tipo_sensor')
export class TipoSensor {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_tipo_sensor' })
  id: string;

  @Column({ name: 'tps_nombre', type: 'varchar', length: 50 })
  nombre: string;

  @Column({ name: 'tps_descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'tps_unidad_medida', type: 'varchar', length: 20 })
  unidadMedida: string;

  @OneToMany(() => Sensor, (s) => s.tipoSensor)
  sensores?: Sensor[];
}
