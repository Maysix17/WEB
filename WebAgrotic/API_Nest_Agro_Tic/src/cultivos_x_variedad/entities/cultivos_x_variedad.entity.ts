// File: src/entities/cultivos_x_variedad/cultivos_x_variedad.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { Variedad } from '../../variedad/entities/variedad.entity';
import { CultivosVariedadXZona } from '../../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';

@Entity('cultivos_x_variedad')
export class CultivosXVariedad {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_cultivos_x_variedad' })
  id: string;

  @Column({ name: 'fk_id_cultivo' })
  fkCultivoId: string;

  @Column({ name: 'fk_id_variedad' })
  fkVariedadId: string;

  @ManyToOne(() => Cultivo, (c) => c.variedades)
  @JoinColumn({ name: 'fk_id_cultivo' })
  cultivo?: Cultivo;

  @ManyToOne(() => Variedad, (v) => v.cultivosXVariedad)
  @JoinColumn({ name: 'fk_id_variedad' })
  variedad?: Variedad;

  @OneToMany(() => CultivosVariedadXZona, (cvz) => cvz.cultivoXVariedad)
  zonas?: CultivosVariedadXZona[];
}
