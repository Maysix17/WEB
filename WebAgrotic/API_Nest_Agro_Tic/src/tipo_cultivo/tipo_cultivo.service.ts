import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoCultivo } from './entities/tipo_cultivo.entity';
import { CreateTipoCultivoDto } from './dto/create-tipo_cultivo.dto';
import { UpdateTipoCultivoDto } from './dto/update-tipo_cultivo.dto';
import { Variedad } from '../variedad/entities/variedad.entity';

@Injectable()
export class TipoCultivoService {
  constructor(
    @InjectRepository(TipoCultivo)
    private tipoCultivoRepository: Repository<TipoCultivo>,
    @InjectRepository(Variedad)
    private variedadRepository: Repository<Variedad>,
  ) {}

  // CREATE
  async create(
    createTipoCultivoDto: CreateTipoCultivoDto,
  ): Promise<TipoCultivo> {
    const tipoCultivo = this.tipoCultivoRepository.create(createTipoCultivoDto);
    return await this.tipoCultivoRepository.save(tipoCultivo);
  }

  // READ ALL
  async findAll(): Promise<TipoCultivo[]> {
    return await this.tipoCultivoRepository.find();
  }

  // READ ONE
  async findOne(id: string): Promise<TipoCultivo> {
    const tipoCultivo = await this.tipoCultivoRepository.findOne({
      where: { id },
    });
    if (!tipoCultivo) {
      throw new NotFoundException(`TipoCultivo con id ${id} no encontrado`);
    }
    return tipoCultivo;
  }

  // UPDATE
  async update(
    id: string,
    updateTipoCultivoDto: UpdateTipoCultivoDto,
  ): Promise<TipoCultivo> {
    const tipoCultivo = await this.findOne(id);
    const updated = Object.assign(tipoCultivo, updateTipoCultivoDto);
    return await this.tipoCultivoRepository.save(updated);
  }

  // DELETE
  async remove(id: string): Promise<void> {
    const tipoCultivo = await this.findOne(id);
    
    // Verificar si hay variedades asociadas a este tipo de cultivo
    const variedadesAsociadas = await this.variedadRepository.count({
      where: { fkTipoCultivoId: id }
    });

    if (variedadesAsociadas > 0) {
      // Obtener algunos nombres de variedades para mostrar en el mensaje
      const variedades = await this.variedadRepository
        .createQueryBuilder('v')
        .where('v.fkTipoCultivoId = :id', { id })
        .limit(3) // Limitar a 3 variedades para el mensaje
        .getMany();

      const nombresVariedades = variedades.map(v => v.nombre).join(', ');
      const mensajeAdicional = variedadesAsociadas > 3
        ? ` y ${variedadesAsociadas - 3} variedades más`
        : '';

      throw new BadRequestException(
        `No se puede eliminar el tipo de cultivo "${tipoCultivo.nombre}" porque tiene ${variedadesAsociadas} variedad(es) asociada(s): ${nombresVariedades}${mensajeAdicional}. ` +
        `Para eliminar este tipo de cultivo, primero debe eliminar o reassignar las variedades asociadas a otros tipos de cultivo. ` +
        `Le sugerimos revisar la sección de variedades para gestionar estas asociaciones.`
      );
    }

    await this.tipoCultivoRepository.remove(tipoCultivo);
  }
}
