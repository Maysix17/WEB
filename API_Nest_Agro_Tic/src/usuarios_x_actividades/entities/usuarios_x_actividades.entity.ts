// File: src/entities/usuarios_x_actividades/usuarios_x_actividades.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Actividad } from '../../actividades/entities/actividades.entity';

@Entity('usuarios_x_actividades')
export class UsuarioXActividad {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_usuarios_x_actividades' })
  id: string;

  @Column({ name: 'fk_id_usuario' })
  fkUsuarioId: string;

  @Column({ name: 'fk_id_actividad' })
  fkActividadId: string;

  @Column({ name: 'uxa_fecha_asignacion', type: 'date' })
  fechaAsignacion: Date;

  @Column({ name: 'uxa_activo', type: 'boolean', default: true })
  activo?: boolean;

  @ManyToOne(() => Usuario, (u) => u.actividadesAsignadas, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_id_usuario' })
  usuario?: Usuario;

  @ManyToOne(() => Actividad, (a) => a.usuariosAsignados, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_id_actividad' })
  actividad?: Actividad;
}
