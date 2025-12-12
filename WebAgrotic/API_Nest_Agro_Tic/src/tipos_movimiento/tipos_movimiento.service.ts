import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoMovimiento } from './entities/tipos_movimiento.entity';
import { CreateTiposMovimientoDto } from './dto/create-tipos_movimiento.dto';
import { UpdateTiposMovimientoDto } from './dto/update-tipos_movimiento.dto';

@Injectable()
export class TiposMovimientoService {
  constructor(
    @InjectRepository(TipoMovimiento)
    private readonly tipoMovimientoRepo: Repository<TipoMovimiento>,
  ) {}

  async create(createDto: CreateTiposMovimientoDto): Promise<TipoMovimiento> {
    const entity = this.tipoMovimientoRepo.create(createDto);
    return await this.tipoMovimientoRepo.save(entity);
  }

  async findAll(): Promise<TipoMovimiento[]> {
    return await this.tipoMovimientoRepo.find();
  }

  async findOne(id: number): Promise<TipoMovimiento> {
    const entity = await this.tipoMovimientoRepo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`TipoMovimiento con ID ${id} no encontrado`);
    return entity;
  }

  async update(
    id: number,
    updateDto: UpdateTiposMovimientoDto,
  ): Promise<TipoMovimiento> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.tipoMovimientoRepo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.tipoMovimientoRepo.remove(entity);
  }
}
