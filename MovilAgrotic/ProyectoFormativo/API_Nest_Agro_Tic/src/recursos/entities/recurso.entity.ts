import { Permiso } from '../../permisos/entities/permiso.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
  ManyToOne, // <-- Importa ManyToOne
  JoinColumn, // <-- Importa JoinColumn
} from 'typeorm';
import { Modulo } from '../../modulos/entities/modulo.entity'; // <-- Importa la nueva entidad

@Entity('recursos')
@Unique(['nombre'])
export class Recurso {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_recurso' })
  id: string;

  @Column({
    name: 'recurso_nombre',
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @OneToMany(() => Permiso, (permiso) => permiso.recurso)
  permisos: Permiso[];

  // ✅ NUEVA RELACIÓN: Muchos Recursos pertenecen a UN Módulo.
  @ManyToOne(() => Modulo, (modulo) => modulo.recursos, {
    nullable: false, // Hacemos que un recurso DEBA tener un módulo.
    onDelete: 'CASCADE', // Si se borra un módulo, se borran sus recursos.
  })
  @JoinColumn({ name: 'fk_id_modulo' }) // Nombre de la nueva columna de llave foránea.
  modulo: Modulo;
}
