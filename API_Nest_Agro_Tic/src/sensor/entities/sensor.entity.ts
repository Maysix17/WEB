// File: src/entities/sensor/sensor.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TipoSensor } from '../../tipo_sensor/entities/tipo_sensor.entity';
import { Zona } from '../../zonas/entities/zona.entity';
import { MedicionSensor } from '../../medicion_sensor/entities/medicion_sensor.entity';

@Entity('sensor')
export class Sensor {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_sensor' })
  id: string;

  @Column({ name: 'sen_nombre', type: 'varchar', length: 50 })
  nombre: string;

  @Column({ name: 'sen_coor_x', type: 'integer' })
  coorX: number;

  @Column({ name: 'sen_coor_y', type: 'integer' })
  coorY: number;

  @Column({
    name: 'sen_rango_minimo',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  rangoMinimo?: number;

  @Column({
    name: 'sen_rango_maximo',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  rangoMaximo?: number;

  @Column({ name: 'sen_img', type: 'varchar', length: 255 })
  img: string;

  @Column({ name: 'sen_estado', type: 'smallint' })
  estado: number;

  @Column({ name: 'sen_fecha_instalacion', type: 'timestamp' })
  fechaInstalacion: Date;

  @Column({
    name: 'sen_fecha_ultimo_mantenimiento',
    type: 'timestamp',
    nullable: true,
  })
  fechaUltimoMantenimiento?: Date;

  @Column({ name: 'fk_id_tipo_sensor' })
  fkTipoSensorId: number;

  @Column({ name: 'fk_id_zona', nullable: true })
  fkZonaId?: number;

  @ManyToOne(() => TipoSensor, (t) => t.sensores)
  @JoinColumn({ name: 'fk_id_tipo_sensor' })
  tipoSensor?: TipoSensor;

  @ManyToOne(() => Zona, (z) => z.sensores)
  @JoinColumn({ name: 'fk_id_zona' })
  zona?: Zona;

  @OneToMany(() => MedicionSensor, (m) => m.zonaMqttConfig)
  mediciones?: MedicionSensor[];
}
