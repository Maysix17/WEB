// File: src/entities/bodega/bodega.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LotesInventario } from '../../lotes_inventario/entities/lotes_inventario.entity';

@Entity('bodega')
export class Bodega {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_bodega' })
  id: string;

  @Column({ name: 'bod_numero', type: 'varchar', length: 15 })
  numero: string;

  @Column({ name: 'bod_nombre', type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => LotesInventario, (li) => li.bodega)
  lotesInventario?: LotesInventario[];
}
