import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bodega } from './entities/bodega.entity';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Injectable()
export class BodegaService {
  constructor(
    @InjectRepository(Bodega)
    private readonly bodegaRepository: Repository<Bodega>,
  ) {}

  async create(createBodegaDto: CreateBodegaDto): Promise<Bodega> {
    const bodega = this.bodegaRepository.create(createBodegaDto);
    return this.bodegaRepository.save(bodega);
  }

  async findAll(): Promise<Bodega[]> {
    return this.bodegaRepository.find();
  }

  async findOne(id: string): Promise<Bodega> {
    const bodega = await this.bodegaRepository.findOne({ where: { id } });
    if (!bodega) {
      throw new NotFoundException(`Bodega with ID ${id} not found`);
    }
    return bodega;
  }

  async update(id: string, updateBodegaDto: UpdateBodegaDto): Promise<Bodega> {
    const bodega = await this.bodegaRepository.preload({
      id,
      ...updateBodegaDto,
    });
    if (!bodega) throw new NotFoundException(`Bodega with ID ${id} not found`);
    return this.bodegaRepository.save(bodega);
  }

  async remove(id: string): Promise<void> {
    const bodega = await this.findOne(id);
    await this.bodegaRepository.remove(bodega);
  }
}
