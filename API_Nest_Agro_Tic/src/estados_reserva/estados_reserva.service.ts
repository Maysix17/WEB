import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoReserva } from './entities/estados_reserva.entity';
import { CreateEstadosReservaDto } from './dto/create-estados_reserva.dto';
import { UpdateEstadosReservaDto } from './dto/update-estados_reserva.dto';

@Injectable()
export class EstadosReservaService {
  constructor(
    @InjectRepository(EstadoReserva)
    private readonly estadoReservaRepo: Repository<EstadoReserva>,
  ) {}

  async create(createDto: CreateEstadosReservaDto): Promise<EstadoReserva> {
    const entity = this.estadoReservaRepo.create(createDto);
    return await this.estadoReservaRepo.save(entity);
  }

  async findAll(): Promise<EstadoReserva[]> {
    return await this.estadoReservaRepo.find({ relations: ['reservas'] });
  }

  async findOne(id: number): Promise<EstadoReserva> {
    const entity = await this.estadoReservaRepo.findOne({
      where: { id },
      relations: ['reservas'],
    });
    if (!entity)
      throw new NotFoundException(`EstadoReserva con ID ${id} no encontrado`);
    return entity;
  }

  async update(
    id: number,
    updateDto: UpdateEstadosReservaDto,
  ): Promise<EstadoReserva> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.estadoReservaRepo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.estadoReservaRepo.remove(entity);
  }
}
