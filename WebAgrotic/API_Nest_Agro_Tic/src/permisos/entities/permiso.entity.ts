import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Roles } from '../../roles/entities/role.entity';
import { Recurso } from '../../recursos/entities/recurso.entity';

@Entity({ name: 'permisos' })
// ✅ ¡IMPORTANTE! Evita permisos duplicados, como tener dos veces "crear" para "productos".
@Unique(['accion', 'recurso'])
export class Permiso {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_permiso' })
  id: string;

  @Column({
    name: 'permiso_accion',
    type: 'varchar',
    length: 50,
  })
  accion: string; // Ej: 'crear', 'leer', 'actualizar', 'eliminar'

  // ✅ RELACIÓN CLAVE: Muchos permisos pertenecen a UN recurso.
  @ManyToOne(() => Recurso, (recurso) => recurso.permisos, {
    nullable: false, // Un permiso siempre debe tener un recurso
    onDelete: 'CASCADE', // Si se borra un recurso, se borran sus permisos asociados
    eager: true, // Carga el recurso automáticamente al consultar un permiso
  })
  @JoinColumn({ name: 'fk_id_recurso' }) // Nombre de la columna de la llave foránea
  recurso: Recurso;

  // La relación con Roles se mantiene igual: un permiso puede estar en muchos roles.
  @ManyToMany(() => Roles, (rol) => rol.permisos)
  roles: Roles[];
}
