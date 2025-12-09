import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioXActividad } from './entities/usuarios_x_actividades.entity';
import { CreateUsuariosXActividadeDto } from './dto/create-usuarios_x_actividade.dto';
import { UpdateUsuariosXActividadeDto } from './dto/update-usuarios_x_actividade.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class UsuariosXActividadesService {
  constructor(
    @InjectRepository(UsuarioXActividad)
    private readonly uxActRepo: Repository<UsuarioXActividad>,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createDto: CreateUsuariosXActividadeDto,
  ): Promise<UsuarioXActividad> {
    const entity = this.uxActRepo.create(createDto);
    const savedEntity = await this.uxActRepo.save(entity);

    // Emit notification to the assigned user
    const assignedBy = 'Sistema';

    const notification = {
      id: savedEntity.id,
      activityCategory:
        savedEntity.actividad?.categoriaActividad?.nombre || 'Sin categoría',
      zone:
        savedEntity.actividad?.cultivoVariedadZona?.zona?.nombre || 'Sin zona',
      assignmentDate: savedEntity.fechaAsignacion,
      assignedBy: assignedBy,
    };

    this.notificationsGateway.emitNotificationToUser(
      savedEntity.fkUsuarioId,
      notification,
    );

    return savedEntity;
  }

  async findAll(): Promise<UsuarioXActividad[]> {
    return await this.uxActRepo.find({
      relations: [
        'usuario',
        'actividad',
        'actividad.categoriaActividad',
        'actividad.cultivoVariedadZona',
        'actividad.cultivoVariedadZona.zona',
      ],
    });
  }

  async findOne(id: string): Promise<UsuarioXActividad> {
    const entity = await this.uxActRepo.findOne({
      where: { id },
      relations: [
        'usuario',
        'actividad',
        'actividad.categoriaActividad',
        'actividad.cultivoVariedadZona',
        'actividad.cultivoVariedadZona.zona',
      ],
    });
    if (!entity)
      throw new NotFoundException(
        `UsuarioXActividad con ID ${id} no encontrado`,
      );
    return entity;
  }

  async update(
    id: string,
    updateDto: UpdateUsuariosXActividadeDto,
  ): Promise<UsuarioXActividad> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.uxActRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.uxActRepo.remove(entity);
  }

  async findByActividad(
    actividadId: string,
    activo?: boolean,
  ): Promise<any[]> {
    const qb = this.uxActRepo.createQueryBuilder('uxa')
      .leftJoinAndSelect('uxa.usuario', 'u')
      .where('uxa.fkActividadId = :actividadId', { actividadId });

    if (activo !== undefined) {
      qb.andWhere('uxa.activo = :activo', { activo });
    }

    const results = await qb.getMany();

    // Transformar los resultados para asegurar que los datos del usuario estén correctamente estructurados
    return results.map(result => ({
      id: result.id,
      fkUsuarioId: result.fkUsuarioId,
      fkActividadId: result.fkActividadId,
      fechaAsignacion: result.fechaAsignacion,
      activo: result.activo,
      usuario: {
        id: result.usuario?.id,
        dni: result.usuario?.dni,
        nombres: result.usuario?.nombres,
        apellidos: result.usuario?.apellidos,
      }
    }));
  }

  async finalizarByActividad(actividadId: string): Promise<void> {
    await this.uxActRepo.update(
      { fkActividadId: actividadId },
      { activo: false },
    );
  }

  async findByUser(userId: string): Promise<UsuarioXActividad[]> {
    return await this.uxActRepo.find({
      where: { fkUsuarioId: userId, activo: true },
      relations: [
        'usuario',
        'actividad',
        'actividad.categoriaActividad',
        'actividad.cultivoVariedadZona',
        'actividad.cultivoVariedadZona.zona',
      ],
      order: { fechaAsignacion: 'DESC' },
    });
  }
}
