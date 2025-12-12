import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variedad } from './entities/variedad.entity';
import { CultivosXVariedad } from '../cultivos_x_variedad/entities/cultivos_x_variedad.entity';
import { CreateVariedadDto } from './dto/create-variedad.dto';
import { UpdateVariedadDto } from './dto/update-variedad.dto';

@Injectable()
export class VariedadesService {
  constructor(
    @InjectRepository(Variedad)
    private readonly variedadRepo: Repository<Variedad>,
    @InjectRepository(CultivosXVariedad)
    private readonly cultivosXVariedadRepo: Repository<CultivosXVariedad>,
  ) {}

  async create(dto: CreateVariedadDto): Promise<Variedad> {
    console.log('Creating variedad with dto:', dto);
    const variedad = this.variedadRepo.create(dto);
    console.log('Created variedad entity:', variedad);
    const saved = await this.variedadRepo.save(variedad);
    console.log('Saved variedad:', saved);
    // Load relations for the response
    const variedadWithRelation = await this.variedadRepo.findOne({
      where: { id: saved.id },
      relations: ['tipoCultivo'],
    });
    if (!variedadWithRelation) {
      throw new Error('Variedad no encontrada después de guardar');
    }
    return variedadWithRelation;
  }

  async findAll(): Promise<Variedad[]> {
    const variedades = await this.variedadRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.tipoCultivo', 'tc')
      .getMany();
    console.log('Variedades loaded:', JSON.stringify(variedades, null, 2));
    return variedades;
  }

  async findOne(id: string): Promise<Variedad> {
    const variedad = await this.variedadRepo.findOne({
      where: { id },
    });
    if (!variedad)
      throw new NotFoundException(`Variedad con id ${id} no encontrada`);
    return variedad;
  }

  async update(id: string, dto: UpdateVariedadDto): Promise<Variedad> {
    const variedad = await this.findOne(id);
    Object.assign(variedad, dto);
    return await this.variedadRepo.save(variedad);
  }

  async remove(id: string): Promise<void> {
    const variedad = await this.findOne(id);
    
    // Verificar si la variedad tiene registros asociados
    const hasAssociatedRecords = await this.checkAssociatedRecords(id);
    if (hasAssociatedRecords) {
      throw new BadRequestException(
        'No se puede eliminar la variedad porque tiene cultivos asociados.'
      );
    }
    
    await this.variedadRepo.remove(variedad);
  }

  /**
   * Verifica si una variedad tiene registros asociados (cultivos)
   */
  async checkAssociatedRecords(variedadId: string): Promise<boolean> {
    try {
      const associatedRecords = await this.cultivosXVariedadRepo.count({
        where: { fkVariedadId: variedadId }
      });
      
      console.log(`Variedad ${variedadId} has ${associatedRecords} associated records`);
      return associatedRecords > 0;
    } catch (error) {
      console.error('Error checking associated records for variedad:', variedadId, error);
      // Por seguridad, asumir que hay registros asociados si hay error
      return true;
    }
  }
}
