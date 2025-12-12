// File: src/entities/variedad/variedad.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TipoCultivo } from '../../tipo_cultivo/entities/tipo_cultivo.entity';
import { CultivosXVariedad } from '../../cultivos_x_variedad/entities/cultivos_x_variedad.entity';

@Entity('variedad')
export class Variedad {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_variedad' })
  id: string;

  @Column({ name: 'var_nombre', type: 'varchar', length: 50 })
  nombre: string;

  @Column({ name: 'fk_id_tipo_cultivo', nullable: true })
  fkTipoCultivoId?: string;

  @ManyToOne(() => TipoCultivo, (t) => t.variedades)
  @JoinColumn({ name: 'fk_id_tipo_cultivo' })
  tipoCultivo?: TipoCultivo;

  @OneToMany(() => CultivosXVariedad, (cxv) => cxv.variedad)
  cultivosXVariedad?: CultivosXVariedad[];
}
