import { Recurso } from '../../recursos/entities/recurso.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity('modulos')
@Unique(['nombre']) // No permitir módulos con el mismo nombre
export class Modulo {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_modulo' })
  id: string;

  @Column({
    name: 'modulo_nombre',
    type: 'varchar',
    length: 100,
  })
  nombre: string; // Ej: 'Inventario', 'Ventas', 'Administración'

  // ✅ RELACIÓN: Un Módulo puede tener muchos Recursos.
  @OneToMany(() => Recurso, (recurso) => recurso.modulo)
  recursos: Recurso[];
}
