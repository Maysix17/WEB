import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedida } from './entities/unidades_medida.entity';
import { CreateUnidadesMedidaDto } from './dto/create-unidades_medida.dto';
import { UpdateUnidadesMedidaDto } from './dto/update-unidades_medida.dto';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepo: Repository<UnidadMedida>,
  ) {}

  async create(createDto: CreateUnidadesMedidaDto): Promise<UnidadMedida> {
    const entity = this.unidadMedidaRepo.create(createDto);
    return await this.unidadMedidaRepo.save(entity);
  }

  async findAll(): Promise<UnidadMedida[]> {
    return await this.unidadMedidaRepo.find();
  }

  async findOne(id: string): Promise<UnidadMedida> {
    const entity = await this.unidadMedidaRepo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`UnidadMedida con ID ${id} no encontrado`);
    return entity;
  }

  async update(
    id: string,
    updateDto: UpdateUnidadesMedidaDto,
  ): Promise<UnidadMedida> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.unidadMedidaRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.unidadMedidaRepo.remove(entity);
  }
}
