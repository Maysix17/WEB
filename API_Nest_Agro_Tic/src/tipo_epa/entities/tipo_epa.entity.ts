// File: src/entities/tipo_epa/tipo_epa.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Epa } from '../../epa/entities/epa.entity';

@Entity('tipo_epa')
export class TipoEpa {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_tipo_epa' })
  id: string;

  @Column({
    name: 'tipo_epa_nombre',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  nombre: string;

  @OneToMany(() => Epa, (epa) => epa.tipoEpa)
  epas?: Epa[];
}
