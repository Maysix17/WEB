import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ropa } from './entities/ropa.entity';
import { CreateRopaDto } from './dto/create-ropa.dto';
import { UpdateRopaDto } from './dto/update-ropa.dto';

@Injectable()
export class RopaService {
  constructor(
    @InjectRepository(Ropa)
    private ropaRepository: Repository<Ropa>,
  ) {}

  async create(createRopaDto: CreateRopaDto): Promise<Ropa> {
    const ropa = this.ropaRepository.create(createRopaDto);
    return await this.ropaRepository.save(ropa);
  }

  async findAll(): Promise<Ropa[]> {
    return await this.ropaRepository.find();
  }

  async findOne(id: string): Promise<Ropa> {
    const ropa = await this.ropaRepository.findOne({
      where: { id },
    });
    if (!ropa) {
      throw new NotFoundException(`Ropa con id ${id} no encontrada`);
    }
    return ropa;
  }

  async update(id: string, updateRopaDto: UpdateRopaDto): Promise<Ropa> {
    const ropa = await this.findOne(id);
    const updated = Object.assign(ropa, updateRopaDto);
    return await this.ropaRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const ropa = await this.findOne(id);
    await this.ropaRepository.remove(ropa);
  }
}