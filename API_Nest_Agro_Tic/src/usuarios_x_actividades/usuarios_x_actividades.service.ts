import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioXActividad } from './entities/usuarios_x_actividades.entity';
import { CreateUsuariosXActividadeDto } from './dto/create-usuarios_x_actividade.dto';
import { UpdateUsuariosXActividadeDto } from './dto/update-usuarios_x_actividade.dto';

@Injectable()
export class UsuariosXActividadesService {
  constructor(
    @InjectRepository(UsuarioXActividad)
    private readonly uxActRepo: Repository<UsuarioXActividad>,
  ) {}

  async create(
    createDto: CreateUsuariosXActividadeDto,
  ): Promise<UsuarioXActividad> {
    const entity = this.uxActRepo.create(createDto);
    return await this.uxActRepo.save(entity);
  }

  async findAll(): Promise<UsuarioXActividad[]> {
    return await this.uxActRepo.find({ relations: ['usuario', 'actividad'] });
  }

  async findOne(id: string): Promise<UsuarioXActividad> {
    const entity = await this.uxActRepo.findOne({
      where: { id },
      relations: ['usuario', 'actividad'],
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
  ): Promise<UsuarioXActividad[]> {
    const where: any = { fkActividadId: actividadId };
    if (activo !== undefined) where.activo = activo;
    return await this.uxActRepo.find({
      where,
      relations: ['usuario'],
    });
  }

  async finalizarByActividad(actividadId: string): Promise<void> {
    await this.uxActRepo.update(
      { fkActividadId: actividadId },
      { activo: false },
    );
  }
}
