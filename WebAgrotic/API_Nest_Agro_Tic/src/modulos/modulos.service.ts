import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modulo } from './entities/modulo.entity';
import { CreateModuloDto } from './dto/create-modulo.dto';

@Injectable()
export class ModulosService {
  constructor(
    @InjectRepository(Modulo)
    private readonly moduloRepository: Repository<Modulo>,
  ) {}

  async create(createModuloDto: CreateModuloDto): Promise<Modulo> {
    const existe = await this.moduloRepository.findOneBy({
      nombre: createModuloDto.nombre,
    });

    if (existe) {
      throw new ConflictException('Ya existe un módulo con ese nombre.');
    }

    const nuevoModulo = this.moduloRepository.create(createModuloDto);
    return this.moduloRepository.save(nuevoModulo);
  }

  findAll(): Promise<Modulo[]> {
    return this.moduloRepository.find({
      order: { nombre: 'ASC' },
      relations: ['recursos', 'recursos.permisos'],
    });
  }

  async findOne(id: string): Promise<Modulo> {
    const modulo = await this.moduloRepository.findOneBy({ id });
    if (!modulo) {
      throw new NotFoundException(`Módulo con ID "${id}" no encontrado.`);
    }
    return modulo;
  }

  async remove(id: string): Promise<void> {
    const modulo = await this.findOne(id);
    await this.moduloRepository.remove(modulo);
  }
}
