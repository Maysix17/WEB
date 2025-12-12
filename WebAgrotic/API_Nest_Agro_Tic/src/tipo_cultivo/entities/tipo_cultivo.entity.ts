// -----------------------------
// File: src/entities/tipo-cultivo/tipo-cultivo.entity.ts
// -----------------------------
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Variedad } from '../../variedad/entities/variedad.entity';

@Entity('tipo_cultivo')
export class TipoCultivo {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_tipo_cultivo' })
  id: string; // Cambiado de number a string

  @Column({ name: 'tpc_nombre', type: 'varchar', length: 50 })
  nombre: string;

  @Column({ name: 'tpc_es_perenne', type: 'boolean', default: false })
  esPerenne: boolean;

  @OneToMany(() => Variedad, (v) => v.tipoCultivo)
  variedades?: Variedad[];
}
