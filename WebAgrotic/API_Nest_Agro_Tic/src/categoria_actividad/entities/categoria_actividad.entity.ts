// File: src/entities/categoria_actividad/categoria_actividad.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Actividad } from '../../actividades/entities/actividades.entity';

@Entity('categoria_actividad')
export class CategoriaActividad {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_categoria_actividad' })
  id: string;

  @Column({ name: 'cat_nombre', type: 'varchar', length: 50 })
  nombre: string;

  @OneToMany(() => Actividad, (a) => a.categoriaActividad)
  actividades?: Actividad[];
}
