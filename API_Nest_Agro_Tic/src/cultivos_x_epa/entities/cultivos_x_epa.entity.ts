// File: src/entities/cultivos_x_epa/cultivos_x_epa.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CultivosXVariedad } from '../../cultivos_x_variedad/entities/cultivos_x_variedad.entity';
import { Epa } from '../../epa/entities/epa.entity';

@Entity('cultivos_x_epa')
export class CultivosXEpa {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_cultivos_x_epa' })
  id: string;

  @Column({ name: 'cxp_fecha_deteccion', type: 'date' })
  fechaDeteccion: string;

  @Column({ name: 'cxp_estado', type: 'smallint' })
  estado: number;

  @Column({ name: 'fk_id_cultivos_x_variedad' })
  fkCultivosXVariedadId: number;

  @Column({ name: 'fk_id_epa' })
  fkEpaId: number;

  @ManyToOne(() => CultivosXVariedad, (cxv) => cxv.zonas)
  @JoinColumn({ name: 'fk_id_cultivos_x_variedad' })
  cultivosXVariedad?: CultivosXVariedad;

  @ManyToOne(() => Epa, (e) => e.cultivosXepa)
  @JoinColumn({ name: 'fk_id_epa' })
  epa?: Epa;
}
