import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ficha } from './entities/ficha.entity';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';

@Injectable()
export class FichasService {
  constructor(
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
  ) {}

  async create(createFichaDto: CreateFichaDto) {
    const ficha = this.fichaRepository.create(createFichaDto);
    return this.fichaRepository.save(ficha);
  }

  async findAll() {
    return this.fichaRepository.find();
  }

  async findOne(id: string) {
    return this.fichaRepository.findOne({ where: { id } });
  }

  async update(id: string, updateFichaDto: UpdateFichaDto) {
    await this.fichaRepository.update(id, updateFichaDto);
    return this.fichaRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    return this.fichaRepository.delete(id);
  }
}
