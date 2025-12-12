// File: src/entities/medicion_sensor/medicion_sensor.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ZonaMqttConfig } from '../../mqtt_config/entities/zona_mqtt_config.entity';

@Entity('medicion_sensor')
export class MedicionSensor {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_medicion' })
  id: string;

  @Column({ name: 'med_key', type: 'varchar', length: 50 })
  key: string; // e.g., "temperatura", "humedad"

  @Column({ name: 'med_valor', type: 'numeric', precision: 10, scale: 2 })
  valor: number;

  @Column({ name: 'med_fecha_medicion', type: 'timestamp' })
  fechaMedicion: Date;

  @Column({ name: 'med_unidad', type: 'varchar', length: 20, nullable: true })
  unidad: string;

  @Column({ name: 'med_tipo', type: 'varchar', length: 20, default: 'regular' })
  tipo: string; // 'regular' o 'alerta'

  @Column({ name: 'fk_id_zona_mqtt_config' })
  fkZonaMqttConfigId: string;

  @ManyToOne(() => ZonaMqttConfig, (zmc) => zmc.mediciones)
  @JoinColumn({ name: 'fk_id_zona_mqtt_config' })
  zonaMqttConfig?: ZonaMqttConfig;
}
