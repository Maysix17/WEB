import { Usuario } from '../../usuarios/entities/usuario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permiso } from '../../permisos/entities/permiso.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_rol' })
  id: string;

  @Column({ name: 'rol_nombre', type: 'varchar', length: 50, unique: true })
  nombre: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];

  // ✅ Esta relación sigue siendo correcta y ahora apunta al nuevo "Permiso".
  @ManyToMany(() => Permiso, {
    cascade: true,
    eager: true,
  })
  @JoinTable({
    name: 'roles_permisos',
    joinColumn: {
      name: 'rol_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permiso_id',
      referencedColumnName: 'id',
    },
  })
  permisos: Permiso[];

  // --- INICIO DE LA NUEVA LÓGICA DE JERARQUÍA ---

  /**
   * Lista de roles que ESTE rol tiene permitido crear.
   * Ejemplo: Si este rol es 'SECRETARIA', aquí podría estar el rol 'INSTRUCTOR'.
   */
  @ManyToMany(() => Roles, (rol) => rol.rolesQuePuedenCrearme)
  @JoinTable({
    name: 'rol_creacion_jerarquia', // Tabla que almacena las reglas
    joinColumn: {
      name: 'rol_creador_id', // El rol que tiene el poder
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'rol_creable_id', // El rol que puede ser creado
      referencedColumnName: 'id',
    },
  })
  rolesQuePuedeCrear: Roles[];

  /**
   * Lista de roles que pueden crear a ESTE rol.
   * Es el inverso de la relación anterior, útil para consultas.
   */
  @ManyToMany(() => Roles, (rol) => rol.rolesQuePuedeCrear)
  rolesQuePuedenCrearme: Roles[];

  // --- FIN DE LA NUEVA LÓGICA DE JERARQUÍA ---
}
