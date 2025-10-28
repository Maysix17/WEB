// File: src/entities/epa/epa.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CultivosXEpa } from '../../cultivos_x_epa/entities/cultivos_x_epa.entity';
import { TipoEpa } from '../../tipo_epa/entities/tipo_epa.entity';

@Entity('epa')
export class Epa {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_epa' })
  id: string;

  @Column({ name: 'epa_nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'epa_descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'epa_img_url', type: 'varchar', length: 255, nullable: true })
  imgUrl?: string;

  @Column({ name: 'fk_id_tipo_epa', type: 'int' })
  tipoEpaId: number;

  @ManyToOne(() => TipoEpa, (tipoEpa) => tipoEpa.epas)
  @JoinColumn({ name: 'fk_id_tipo_epa' })
  tipoEpa: TipoEpa;

  @OneToMany(() => CultivosXEpa, (cxe) => cxe.epa)
  cultivosXepa?: CultivosXEpa[];
}
