import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../../usuarios/entities/usuario.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_session' })
  id: string;

  @Column({ name: 'session_token_hash', type: 'varchar', length: 255 })
  tokenHash: string;

  @Column({ name: 'session_expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'session_is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_id_usuario' })
  usuario: Usuario;

  @CreateDateColumn({ name: 'session_created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'session_updated_at' })
  updatedAt: Date;
}
